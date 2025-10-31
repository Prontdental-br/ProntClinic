/* eslint-disable prettier/prettier */
import { Injectable, Scope } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { UpdateAccountDto } from './dto/update-account.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { User } from 'src/users/entities/user.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { sendEmail } from 'src/utils/sendEmail';
import { ReserveAccount } from './entities/reserve_accounts';
import * as argon2 from 'argon2';
import { Sequelize } from 'sequelize';
import pLimit from 'p-limit';
import { Op } from 'sequelize';

@Injectable({ scope: Scope.REQUEST })
export class AccountsService {
  constructor(
    @InjectModel(Account) private accountModel: typeof Account,
    private tenantService: TenantService,
    @InjectConnection() private sequelize: Sequelize,
  ) {}

  signup(createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountModel.create({
      ...createAccountDto,
    });
  }

  findAll() {
    return this.accountModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  findAllWithClinicAndUsers() {
    return this.accountModel.findAll({
      include: [{ model: Clinic }, { model: User }],
    });
  }

  async me() {
    const user: any = await User.findByPk(this.tenantService.userTenant.id);

    const userJson = user.toJSON();
    delete userJson.password;

    let account: any = await this.accountModel.findByPk(
      this.tenantService.tenant.id,
      {
        include: ['asaasAccount'],
      },
    );
    account = account.toJSON();
    account = {
      ...account,
      asaasAccount: account.asaasAccount ? account.asaasAccount.active : false,
      user: userJson,
    };

    return account;
  }

  async getAccountStatus() {
    const tenant = this.tenantService.tenant;

    if (!tenant) {
      return {
        active: false,
        expiredSubscription: true,
      };
    }

    return {
      active: tenant.active,
      expiredSubscription: tenant.expiredSubscription,
    };
  }

  findOne(id: string) {
    return this.accountModel.findByPk(id, {
      rejectOnEmpty: false,
      include: [{ model: Clinic }],
    });
  }

  update(id: string, updateAccountDto: UpdateAccountDto) {
    return this.accountModel.update(updateAccountDto, {
      where: {
        id,
      },
    });
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async migrateReserveAccounts(): Promise<{ added: number; skipped: number }> {
    const reserveAccounts = await ReserveAccount.findAll({
      where: {
        active: true,
        expiredSubscription: false,
        //   [Op.or]: [
        //   { description: null },
        //   { description: '' }
        // ]
      },
    });

    const uniqueEmails = new Set<string>();
    let addedCount = 0;
    let skippedCount = 0;

    const BATCH_SIZE = 10;
    const limit = pLimit(1);

    const processReserveAccount = async (reserveAccount: any) => {
      if (!reserveAccount.email || !reserveAccount.password) {
        console.warn(
          `Dados inválidos para conta: ${reserveAccount.name}. Pulando...`,
        );
        skippedCount++;
        return;
      }

      if (uniqueEmails.has(reserveAccount.email)) {
        skippedCount++;
        return;
      }
      uniqueEmails.add(reserveAccount.email);

      const existingUser = await User.findOne({
        where: { email: reserveAccount.email },
      });
      if (existingUser) {
        console.log(
          `Usuário com e-mail ${reserveAccount.email} já existe. Ignorando...`,
        );
        skippedCount++;
        return;
      }

      const transaction = await this.sequelize.transaction();
      try {
        const hashedPassword = await argon2.hash(reserveAccount.password);

        const account = await Account.create(
          {
            name: reserveAccount.name,
            description: reserveAccount.description || 'OK',
            consultationTime: reserveAccount.consultationTime,
            cellPhone: reserveAccount.cellPhone,
            type: reserveAccount.type,
            planType: reserveAccount.planType,
            expiredSubscription: reserveAccount.expiredSubscription,
            expiresIn: reserveAccount.expiresIn,
            balancer: reserveAccount.balancer,
            lastSession: reserveAccount.lastSession,
          },
          { transaction },
        );

        await account.reload({ transaction });

        const newSchemaName = `${process.env.NAME_SCHEMA_CLIENT}${account.idSeq}`;
        const functionName = process.env.NAME_FUNCTION_SCHEMA;
        const baseSchema = process.env.NAME_SCHEMA_REF;

        await this.sequelize.query(`SELECT ${functionName}(:base, :new);`, {
          replacements: { base: baseSchema, new: newSchemaName },
          transaction,
        });

        await User.create(
          {
            name: reserveAccount.name,
            email: reserveAccount.email,
            password: hashedPassword,
            accountId: account.id,
            activated: true,
            type: reserveAccount.type,
          },
          { transaction },
        );

        await transaction.commit();

        const emailSubject =
          '🎉 Bem-vindo ao Clairis! Seus dados de acesso chegaram!';
        const emailHtml = this.buildWelcomeEmail(
          reserveAccount.email,
          reserveAccount.password,
        );

        await sendEmail(reserveAccount.email, emailSubject, emailHtml);

        addedCount++;
        console.log(`Conta migrada: ${reserveAccount.email}`);
      } catch (error) {
        await transaction.rollback();
        console.error(`Erro ao migrar conta: ${reserveAccount.email}`, error);
        skippedCount++;
      }
    };

    for (let i = 0; i < reserveAccounts.length; i += BATCH_SIZE) {
      const batch = reserveAccounts.slice(i, i + BATCH_SIZE);
      console.log(
        `Processando lote ${i / BATCH_SIZE + 1}: ${batch.length} contas`,
      );

      for (const acc of batch) {
        await limit(async () => {
          await processReserveAccount(acc);
          await this.sleep(10000);
        });
      }
    }

    return { added: addedCount, skipped: skippedCount };
  }

  private buildWelcomeEmail(email: string, password: string): string {
    return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bem-vindo ao Clairis!</title>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f6f8fa; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,0.1); }
      .header { background: #00695f; color: #ffffff; text-align: center; padding: 20px; font-size: 22px; font-weight: bold; }
      .content { padding: 25px; text-align: left; font-size: 16px; line-height: 1.5; }
      .content strong { color: #00695f; }
      .cta { display: inline-block; margin: 20px 0; padding: 12px 20px; background: #00695f; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 6px; }
      .footer { text-align: center; font-size: 14px; color: #777; padding: 15px; border-top: 1px solid #eee; }
      .credentials { background: #f2f4f8; padding: 15px; border-radius: 6px; margin-top: 15px; font-size: 15px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🎉 Bem-vindo ao Clairis!</div>
      <div class="content">
        <p>Olá! 👋</p>
        <p>Seu acesso ao sistema <strong>Clairis</strong> está liberado!</p>
        <p>Segue abaixo seus dados de acesso:</p>

        <div class="credentials">
          <p>🔗 <strong>Link de acesso:</strong> <a href="https://app.clairis.com.br/login" target="_blank">https://app.clairis.com.br/login</a></p>
          <p>📧 <strong>E-mail:</strong> ${email}</p>
          <p>🔑 <strong>Senha:</strong> ${password}</p>
        </div>

        <a href="https://app.clairis.com.br/login" class="cta">Acessar Agora</a>

        <p>💡 <strong>Clairis</strong> é o sistema feito para facilitar sua gestão e impulsionar sua clínica com inteligência e praticidade.</p>
        <p><em>Clairis — quando a gestão é clara, o crescimento é natural.</em></p>
      </div>
      <div class="footer">
        &copy; 2025 Clairis. Todos os direitos reservados.
      </div>
    </div>
  </body>
  </html>`;
  }

  hashData(data: string) {
    return argon2.hash(data);
  }
}
