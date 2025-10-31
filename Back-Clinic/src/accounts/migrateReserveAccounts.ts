import { Injectable } from '@nestjs/common';
import { ReserveAccount } from './entities/reserve_accounts';
import { Account } from './entities/account.entity';
import * as argon2 from 'argon2';
import { User } from 'src/users/entities/user.entity';
import { sendEmail } from 'src/utils/sendEmail';


@Injectable()
export class MigrateReserveAccountsService {
  constructor(
   
  ) {}

   async migrateReserveAccounts(): Promise<void> {
    
    const reserveAccounts = await ReserveAccount.findAll({
      where: {
        active: true,
        expiredSubscription: false,
      },
    });

    
    const uniqueEmails = new Set<string>();

    for (const reserveAccount of reserveAccounts) {
    
      if (uniqueEmails.has(reserveAccount.email)) {
        continue;
      }

  
      uniqueEmails.add(reserveAccount.email);

      
      const existingUser = await User.findOne({
        where: {
          email: reserveAccount.email,
        },
      });

      if (existingUser) {
      
        console.log(`Usuário com e-mail ${reserveAccount.email} já existe. Ignorando...`);
        continue;
      }

     
      const hashedPassword = await argon2.hash(reserveAccount.password);

      const account = await Account.create({
        name: reserveAccount.name,
        description: reserveAccount.description || '',
        consultationTime: reserveAccount.consultationTime,
        cellPhone: reserveAccount.cellPhone,
        type: reserveAccount.type,
        planType: reserveAccount.planType,
        expiredSubscription: reserveAccount.expiredSubscription,
        expiresIn: reserveAccount.expiresIn,
        balancer: reserveAccount.balancer,
        lastSession: reserveAccount.lastSession,
      });

  
      const user = await User.create({
        name: reserveAccount.name,
        email: reserveAccount.email,
        password: hashedPassword,
        accountId: account.id,
        activated: true,
        type: reserveAccount.type,
      });

    
      const emailSubject = 'Sua conta foi criada com sucesso!';
      const emailText = `
        Olá ${reserveAccount.name},
        
        Sua conta foi criada com sucesso!
        
        Login: ${reserveAccount.email}
        Senha: ${reserveAccount.password} (recomendamos que altere sua senha assim que acessar)

        Você já pode acessar sua conta no sistema utilizando as informações acima.
        
        Atenciosamente,
        Equipe de Suporte
      `;

      await sendEmail(reserveAccount.email, emailSubject, emailText);
    }
  }


   hashData(data: string) {
      return argon2.hash(data);
    }
}
