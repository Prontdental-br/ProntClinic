import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  active?: boolean;
}
