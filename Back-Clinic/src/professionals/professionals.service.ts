/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Professional } from './entities/professional.entity';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { AuthService } from 'src/auth/auth/auth.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { JwtService } from '@nestjs/jwt';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { User } from 'src/users/entities/user.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';

@Injectable({ scope: Scope.REQUEST })
export class ProfessionalsService {
  constructor(  
    private tenantService: TenantService,
    private jwtService: JwtService,
    private sequelize: Sequelize,
    private configService: ConfigService,
    private readonly tenantModelService: TenantModelService,
  ) {}

  @TenantModel(Professional)
  private readonly modelProfessional: typeof Professional

  async create(createProfessionalDto: CreateProfessionalDto) {
  const userExists = await this.findByEmail(createProfessionalDto.email);
  if (userExists) {
    throw new BadRequestException('Usuário já existe e-mail cadastrado');
  }

  let createdUser: any = null;

  if (createProfessionalDto['password']) {
    createdUser = await this.signUp({
      name: createProfessionalDto.name,
      email: createProfessionalDto.email,
      type: createProfessionalDto['type'],
      password: createProfessionalDto['password'],
    });
  }

  const resp = await this.modelProfessional.create({
    ...createProfessionalDto,
    userId: createdUser?.userData?.id ?? this.tenantService.userTenant.id,
    accountId: this.tenantService.tenant.id,
  });

  return resp;
}

  async createAdminProfessional(createProfessionalDto: CreateProfessionalDto) {
    const userExists = await this.findByProfessionalEmail(createProfessionalDto.email);
    if (userExists) {
      throw new BadRequestException('Usuário já existe e-mail cadastrado');
    }

    const userId = this.tenantService.userTenant.id;

    const resp = await this.modelProfessional.create({
      ...createProfessionalDto,
      userId,
      accountId: this.tenantService.tenant.id,
      isAdmin: true,
      canAccessPlans: true,
      isPrivate: false,
    });

    return resp;
  }

  findAll() {
    return this.modelProfessional.findAll({
      where: {
        active: 1,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  findOne(id: string) {
    return this.modelProfessional.findOne({
      where: {
        id,
        active: 1,
        accountId: this.tenantService.tenant.id,
      },
      rejectOnEmpty: true,
    });
  }

  findByProfessionalEmail(email: string) {
    return this.modelProfessional.findOne({
      where: {
        email,
        active: 1,
      },
    });
  }

  findByProfessionalEmailWithAccountId(email: string) {
    return this.modelProfessional.findOne({
      where: {
        email,
        active: 1,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

 async update(id: string, updateProfessionalDto) {
  const resp = await this.modelProfessional
    .findOne({
      where: {
        id,
        active: 1,
        accountId: this.tenantService.tenant.id,
      },
      rejectOnEmpty: true,
    })
    .then(async (value) => {
      console.log('updateProfessionalDto', updateProfessionalDto)

      const newValue = {
        id: value.id,
        ...updateProfessionalDto,
      };

      await this.modelProfessional.update(
        {
          ...newValue,
        },
        {
          where: {
            id: value.id,
            accountId: this.tenantService.tenant.id,
          },
        },
      );

  
      if (updateProfessionalDto.password && updateProfessionalDto.email) {
        const existingUser = await User.findOne({
          where: {
            email: updateProfessionalDto.email,
            accountId: this.tenantService.tenant.id,
          },
        });

        if (existingUser) {
    
          const hash = await this.hashData(updateProfessionalDto.password);
          console.log('update password')
          await User.update(
            {
              password: hash,
            },
            {
              where: {
                id: existingUser.id,
              },
            },
          );
        } else {
          await this.signUp({
            name: updateProfessionalDto.name,
            email: updateProfessionalDto.email,
            type: updateProfessionalDto['type'] || 'O',
            password: updateProfessionalDto.password,
          });
        }
      }

      return newValue;
    });

  return resp;
}


 async remove(id: string) {
  const professional = await this.modelProfessional.findOne({
    where: {
      id,
      accountId: this.tenantService.tenant.id,
    },
    rejectOnEmpty: true,
  });

  // Inativa o profissional
  await this.modelProfessional.update(
    { active: 0 },
    {
      where: {
        id: professional.id,
        accountId: this.tenantService.tenant.id,
      },
    },
  );

  if (professional.userId) {
    console.log('Verificando usuário do profissional', professional.userId);

    const user = await User.findOne({
      where: {
        id: professional.userId,
        accountId: this.tenantService.tenant.id,
      },
    });

    if (user && !user.isHolder) {

      await User.update(
        { activated: false },
        {
          where: {
            id: user.id,
            accountId: this.tenantService.tenant.id,
          },
        },
      );

      console.log('Usuário inativado', user.id);
    } 
  }

  return { message: 'Profissional inativado. Usuário tratado conforme regra do titular.' };
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

    const accountSchema = this.tenantService.tenant.idSeq;

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${accountSchema}`;

    //carregar o id da clinica
    const clinic = await Clinic.schema(schemaName).findOne({
      where: {
        accountId: user.accountId,
      },
    });

    return {
      accessToken,
      refreshToken,
      userData: {
        id: user.id,
        role: 'admin',
        email: user.email,
        fullName: user.name,
        username: user.email,
        accountId: user.accountId,
        clinicId: clinic?.id,
      },
    };
  }

  async signUp(createAccountDto): Promise<any> {
    console.log('emailllll: ', createAccountDto.email);
    const userExists = await this.findByEmail(createAccountDto.email);
    if (userExists) {
      throw new BadRequestException('Usuário já existe e-mail cadastrado');
    }
    const hash = await this.hashData(createAccountDto.password);

    const atomic = await this.sequelize.transaction();
    try {
      const newUser = await User.create({
        name: createAccountDto.name,
        email: createAccountDto.email,
        password: hash,
        type: createAccountDto.type,
        activated: true,
        accountId: this.tenantService.tenant.id,
      });
      const token = await this.getTokens(newUser);
      await atomic.commit();
      return token;
    } catch (error) {
      await atomic.rollback();
      throw error;
    }
  }

  async findByEmail(email: string) {
    const user = await User.findOne({
      where: {
        email,
        activated: true
      },
      include: [
        {
          model: Account,
          attributes: ['id'],
        },
      ],
    });
    return user;
  }
}
