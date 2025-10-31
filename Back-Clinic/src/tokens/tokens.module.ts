import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Token } from './entities/token.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([Token, User])],
  controllers: [TokensController],
  providers: [TokensService],
})
export class TokensModule {}
