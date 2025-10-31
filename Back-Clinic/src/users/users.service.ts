import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { TenantException } from 'src/tenant/exception/TenantException';
import { Account } from 'src/accounts/entities/account.entity';
import { AuthService } from 'src/auth/auth/auth.service';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { JwtService } from '@nestjs/jwt';
import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private tenantService: TenantService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExist = await this.findByEmail(createUserDto.email);

    if (userExist) {
      new BadRequestException('Username already exists');
    }

    return this.userModel.create({
      ...createUserDto,
      // accountId: this.tenantService.tenant.id,
    });
  }

  findAll() {
    return this.userModel.findAll({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.userModel.findByPk(id, {
      rejectOnEmpty: true,
    });
    if (user.accountId != this.tenantService.tenant.id) {
      throw new TenantException();
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({
      where: {
        email,
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

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
