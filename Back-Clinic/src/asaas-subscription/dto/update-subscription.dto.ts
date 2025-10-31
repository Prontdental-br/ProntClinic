import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';

export enum Plans {
  ESSENCIAL = 'essencial',
  PRIME = 'prime',
}

export enum PlansTypes {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class UpdateSubscriptionDto {
  @Transform(({ value }) => ('' + value).toLowerCase())
  @IsEnum(PlansTypes)
  type: PlansTypes;

  @Transform(({ value }) => ('' + value).toLowerCase())
  @IsEnum(Plans)
  planName: Plans;
}
