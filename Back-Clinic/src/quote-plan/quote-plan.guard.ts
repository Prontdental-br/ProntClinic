import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { QuotePlan } from './entities/quote-plan.entity';
import { Professional } from 'src/professionals/entities/professional.entity';

@Injectable()
export class QuotePlanGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log(user);

    const countProfissional = await Professional.count({
      where: {
        accountId: user.accountId,
      },
    });

    const quotePlan = await QuotePlan.findOne({
      where: { accountId: user.accountId },
    });

    const quote: number = quotePlan?.quote || 1;

    if (countProfissional >= quote * 10)
      throw new BadRequestException(
        'Você atingiu o número máximo de profissionais cadastrados. Atualize seu plano',
      );

    return true;
  }
}
