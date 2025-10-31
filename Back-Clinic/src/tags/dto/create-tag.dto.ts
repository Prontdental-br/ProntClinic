import { IsNotEmpty } from 'class-validator';
import { IBaseDto } from 'src/base/dto/IBaseDto';

export class CreateTagDto implements IBaseDto {
  @IsNotEmpty({ message: 'Nome não pode ser vazio' })
  name: string;
}
