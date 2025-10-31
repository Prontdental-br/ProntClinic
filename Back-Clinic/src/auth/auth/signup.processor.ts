/* eslint-disable prettier/prettier */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { hash } from 'argon2';
import { User } from 'src/users/entities/user.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { sendEmail } from 'src/utils/sendEmail';
import { Injectable } from '@nestjs/common';

@Injectable()
@Processor('signUpQueue', { concurrency: 1 }) 
export class SignUpProcessor extends WorkerHost {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Account) private accountModel: typeof Account,
  ) {
    super();
  }

  override async process(job: Job<CreateAccountDto>): Promise<void> {
    const data = job.data;
    const transaction = await this.sequelize.transaction();

    try {
      const hashPassword = await hash(data.password);

      const account = await this.accountModel.create(
        { 
          ...data,
        }, 
        { transaction }
      );

      const user = await this.userModel.create({
        name: data.name,
        email: data.email,
        password: hashPassword,
        type: data.type,
        activated: true,
        accountId: account.id,
        isHolder: true,
      }, { transaction });

      const newSchemaName = `${process.env.NAME_SCHEMA_CLIENT}${account.idSeq}`;
      const functionName = process.env.NAME_FUNCTION_SCHEMA;
      const baseSchema = process.env.NAME_SCHEMA_REF;

      await this.sequelize.query(
        `SELECT ${functionName}(:base, :new);`,
        {
          replacements: {
            base: baseSchema,
            new: newSchemaName,
          },
          transaction,
        },
      );

      await transaction.commit();

      const emailSubject = '🎉 Bem-vindo ao Clairis! Cadastro concluído com sucesso!';
      const emailHtml = this.buildWelcomeEmail(user.email);

      await sendEmail(user.email, emailSubject, emailHtml);

    } catch (err) {
      await transaction.rollback();
      console.error('Erro ao processar cadastro:', err);
    }
  }

  private buildWelcomeEmail(email: string): string {
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
      a { color: #ffffff !important; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">🎉 Bem-vindo(a) à Clairis – Gestão clara, crescimento natural.</div>
      <div class="content">
        <p>Olá! 👋</p>
        <p>Seu acesso ao sistema <strong>Clairis</strong> está liberado!</p>
        <p>Segue abaixo seus dados de acesso:</p>

        <div class="credentials">
          <p>🔗 <strong>Link de acesso:</strong> <a href="https://app.clairis.com.br/login" target="_blank">https://app.clairis.com.br/login</a></p>
          <p>📧 <strong>E-mail:</strong> ${email}</p>
        </div>

        <a href="https://app.clairis.com.br/login" class="cta">Acessar Agora</a>

        <p>💡 <strong>Clairis</strong> Sua clínica acaba de ganhar mais organização, agilidade e tecnologia.</p>

        <p>🔑 Acesse agora e comece: <a href="https://app.clairis.com.br/login" class="cta">Entrar na minha conta</a></p>

        <p>Em poucos minutos, você já poderá:</p>
        <ul>
          <li>✅ Automatizar agendamentos e confirmações</li>
          <li>✅ Enviar orçamentos e contratos com assinatura digital</li>
          <li>✅ Centralizar todos os dados dos pacientes</li>
        </ul>

        <p>Conte com a gente para transformar sua gestão!</p>

        <p>Equipe Clairis</p>
        <p>Instagram: <a href="https://www.instagram.com/clairis.ia/" target="_blank">https://www.instagram.com/clairis.ia/</a></p>

        <p><em>Clairis — quando a gestão é clara, o crescimento é natural.</em></p>
      </div>
      <div class="footer">
        &copy; 2025 Clairis. Todos os direitos reservados.
      </div>
    </div>
  </body>
  </html>`;
}
}