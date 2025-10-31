/* eslint-disable prettier/prettier */

import { TenantModelService } from "src/tenant/tenant/tenant.serviceModel";

export const TenantModel = (model: any) => {
    return (target: any, key: string) => {
      const getter = function (this: any) {
        const service = this.tenantModelService as TenantModelService;
        return service.getModelForTenant(model);
      };
  
      Object.defineProperty(target, key, {
        get: getter,
        enumerable: true,
        configurable: true,
      });
    };
  };
