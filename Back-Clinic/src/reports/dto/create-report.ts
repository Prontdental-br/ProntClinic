export class CreateReportDto {
  name: string;
  description: string;
  period: string;
  transactionType: string;
  createdStart: Date;
  createdEnd: Date;
  dueStart: Date;
  dueEnd: Date;
  payStart: Date;
  payEnd: Date;
}
