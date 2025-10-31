import { Module } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsController } from './professionals.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Professional } from './entities/professional.entity';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';

@Module({
  imports: [SequelizeModule.forFeature([Professional, User])],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService, JwtService, TenantModelService],
})
export class ProfessionalsModule {}
