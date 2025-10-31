import { CellPhoneTypeEnum, GenderEnum } from '../entities/patient.entity';

export class CreatePatientDto {
  name: string;
  birthDate: string;
  gender: GenderEnum;
  cpf: string;
  rg: string;
  cellPhone: string;
  internationalPhone: string;
  planType: string;

  responsibleName: string;
  responsibleBirthDate: string;
  responsibleRg: string;
  responsibleCpf: string;
  responsibleCellPhone: string;
  observation: string;

  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;

  avatar: string;
}
