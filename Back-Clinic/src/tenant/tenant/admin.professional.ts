import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Professional } from 'src/professionals/entities/professional.entity';

@Injectable()
export class AdminProfessionalGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const email = request.user.username;
    const professional = await Professional.findOne({ where: { email } });
    if (professional) {
      return professional.isAdmin;
    }
    return true;
  }
}
