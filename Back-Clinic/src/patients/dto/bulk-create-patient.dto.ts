import { CreatePatientDto } from './create-patient.dto';

export class BulkCreatePatientDto extends CreatePatientDto {
  email: string;
  accountId: string;
}
