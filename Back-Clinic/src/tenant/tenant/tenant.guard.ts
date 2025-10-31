import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    await this.tenantService.setTenantBy(
      request.user.accountId,
      request.route.path.includes('asaas-subscription'),
    );
    await this.tenantService.setUserBy(
      request.user.sub,
      request.route.path.includes('asaas-subscription'),
    );
    return true;
  }
}
