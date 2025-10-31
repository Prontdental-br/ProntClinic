/* eslint-disable prettier/prettier */
import { CreateAccountDto } from './../../accounts/dto/create-account.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import AsaasAccount from 'src/accounts/entities/asaasAcount.entity';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { ReserveAccount } from 'src/accounts/entities/reserve_accounts';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Account) private accountModel: typeof Account,
    @InjectModel(ReserveAccount)
    private reserveAccountModel: typeof ReserveAccount,

    @InjectQueue('signUpQueue') private signUpQueue: Queue<CreateAccountDto>,

    private sequelize: Sequelize,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  async signUpFila(createAccountDto: CreateAccountDto) {
    const user = await this.userModel.findOne({
      where: { email: createAccountDto.email },
    });
    if (user) {
      throw new ConflictException('Usuário já existe com este e-mail');
    }

    await this.signUpQueue.add('signUpJob', createAccountDto, {
      jobId: createAccountDto.email,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });

    return {
      message:
        'Cadastro em processamento. Você receberá um e-mail quando for concluído.',
    };
  }

  async signUp(createAccountDto: CreateAccountDto): Promise<any> {
    const user = await this.userModel.findOne({
      where: { email: createAccountDto.email },
    });
    if (user) {
      throw new ConflictException('Usuário já existe com este e-mail');
    }

    const hash = await this.hashData(createAccountDto.password);

    const transaction = await this.sequelize.transaction();

    try {
      const account = await this.accountModel.create(
        { ...createAccountDto },
        { transaction },
      );

      const newUser = await this.userModel.create(
        {
          name: createAccountDto.name,
          email: createAccountDto.email,
          password: hash,
          type: createAccountDto.type,
          activated: true,
          isHolder: true,
          accountId: account.id,
        },
        { transaction },
      );

      const newSchemaName = `${process.env.NAME_SCHEMA_CLIENT}${account.idSeq}`;
      const functionName = process.env.NAME_FUNCTION_SCHEMA;
      const baseSchema = process.env.NAME_SCHEMA_REF;

      console.log('Creating schema-----:', newSchemaName);
      console.log('Using function-----:', functionName);
      console.log('Based on schema-----:', baseSchema);

      const schemaQuery = this.sequelize.query(
        `SELECT ${functionName}(:base, :new);`,
        {
          replacements: {
            base: baseSchema,
            new: newSchemaName,
          },
          transaction,
        },
      );

      const tokenPromise = this.getTokens(newUser);

      await Promise.all([schemaQuery, tokenPromise]);

      await transaction.commit();

      return await tokenPromise;
    } catch (error) {
      console.error('Error creating account:', error);
      await transaction.rollback();

      throw new InternalServerErrorException('Erro interno ao criar conta');
    }
  }

  async signUpReserva(createAccountDto: CreateAccountDto): Promise<any> {
    const transaction = await this.sequelize.transaction();

    const hash = await this.hashData(createAccountDto.password);

    try {
      const account = await this.reserveAccountModel.create(
        {
          ...createAccountDto,
        },
        { transaction },
      );

      await transaction.commit();
      return account; // ou apenas retornar o ID, se preferir
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      await transaction.rollback();
      throw new InternalServerErrorException('Erro ao criar conta');
    }
  }

  async signIn(data: AuthDto) {
    try {
      const user = await this.findByEmail(data.username);
      if (!user) {
        throw new BadRequestException('Usuário não existe');
      }

      console.log('user.activated: ', user);

      const passwordMatches = await argon2.verify(user.password, data.password);
      if (!passwordMatches) {
        throw new BadRequestException('Usuário ou senha incorretos');
      }

      const tokens = await this.getTokens(user);

      await this.accountModel.update(
        { lastSession: new Date() },
        { where: { id: user.accountId } },
      );

      return tokens;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao fazer login');
    }
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async getTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.email,
          accountId: user.accountId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.email,
          accountId: user.accountId,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN,
        },
      ),
    ]);

    const schemaAccount = await this.getSchemaByAccountId(user.accountId);

    const clinic = await Clinic.schema(
      schemaAccount ? schemaAccount : null,
    ).findOne({
      where: {
        accountId: user.accountId,
      },
    });

    const professional = await Professional.schema(
      schemaAccount ? schemaAccount : null,
    ).findOne({
      where: {
        userId: user.id,
        active: 1,
      },
    });

    return {
      accessToken,
      refreshToken,
      userData: {
        id: user.id,
        role: 'admin',
        email: user.email,
        isHolder: user.isHolder,
        fullName: user.name,
        username: user.email,
        accountId: user.accountId,
        clinicId: clinic?.id,
        type: user.type,
        professional,
        planType:
          user.account && user.account.planType ? user.account.planType : null,
        asaasAccount: user.account?.asaasAccount
          ? user.account.asaasAccount.active
          : false,
      },
    };
  }

  // async refreshTokens(userId: string, refreshToken: string) {
  //   const user = await this.usersService.findOne(userId);
  //   if (!user) throw new ForbiddenException('Access Denied');

  //   const refreshTokenMatches = await argon2.verify(
  //   user.refreshToken,
  //     '',
  //     refreshToken,
  //   );

  //   if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

  //   const tokens = await this.getTokens(user.id, user.email, user.accountId);
  //   await this.updateRefreshToken(user.id, tokens.refreshToken);
  //   return tokens;
  // }

  private async findByEmail(email: string) {
    const user = await this.userModel.findOne({
      where: {
        email,
        activated: true,
      },
      include: [
        {
          model: Account,
          attributes: ['id', 'planType'],
          include: [
            {
              model: AsaasAccount,
            },
          ],
        },
        {
          model: Professional,
          attributes: ['id', 'isPrivate'],
        },
      ],
    });
    return user;
  }

  async getSchemaByAccountId(accountId: string): Promise<string> {
    const account = await this.accountModel.findByPk(accountId);
    if (!account || !account.idSeq) {
      return null;
    }

    return `${process.env.NAME_SCHEMA_CLIENT}${account.idSeq}`;
  }
}
