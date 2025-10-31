import { IsNotEmpty } from 'class-validator';

export class CreateCashDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  active?: boolean;
  default?: boolean;
}
