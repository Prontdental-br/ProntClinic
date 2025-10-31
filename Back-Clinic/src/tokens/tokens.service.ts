import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Token } from './entities/token.entity';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { sendEmail } from 'src/utils/sendEmail';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Token) private tokenModel: typeof Token,
  ) {}

  hashData(data: string) {
    return argon2.hash(data);
  }

  async reset(createTokenDto) {
    const user = await this.userModel.findOne({
      where: { email: createTokenDto.email },
    });
    if (!user)
      throw new BadRequestException("user with given email doesn't exist");

    let token = await this.tokenModel.findOne({ where: { userId: user.id } });

    if (!token) {
      token = await this.tokenModel.create({
        userId: user.id,
        token: crypto.randomBytes(32).toString('hex'),
      });
    }

    const link = `${process.env.URL_FRONT}/forgot-password/${user.id}/${token.token}`;

    const text = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de senha</title>
    </head>
    
    <body style="font-family: Arial, sans-serif;">
        <h1>Recuperação de senha</h1>
        <p>Olá,</p>
        <p>Esqueceu sua senha, isso acontece!</p>
        <p style="text-align: center;"><a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #5A5FE0; color: white; text-decoration: none; border-radius: 20px;">Crie uma nova senha</a></p>
    </body>
    
    </html>    
    `;

    await sendEmail(
      createTokenDto.email,
      'Recuperação de senha - Clairis',
      text,
    );

    return {
      msg: 'ok',
    };
  }

  async recover(userId, tokenId, recoverPassword) {
    const user = await this.userModel.findOne({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException("userId doesn't exist");

    const token = await this.tokenModel.findOne({
      where: { userId, token: tokenId },
    });

    if (!token) throw new BadRequestException('Invalid link or expired');

    const hash = await this.hashData(recoverPassword.password);

    await this.userModel.update(
      { password: hash },
      {
        where: { id: user.id },
      },
    );

    await this.tokenModel.destroy({
      where: { userId, token: tokenId },
    });
  }
  
}
