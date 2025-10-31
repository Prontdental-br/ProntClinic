import { TypeEnum } from '../entities/transaction.entity';

export default class CreateTransactionDto {
  description: string;
  value: number;
  type: TypeEnum;
  dateReference: Date;
  dueDate: Date;
  isPaid: boolean;
}
