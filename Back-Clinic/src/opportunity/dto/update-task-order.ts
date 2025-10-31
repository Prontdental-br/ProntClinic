/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';


export class UpdateTaskOrderDtoOpportunity {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOrderItem)
  tasks: TaskOrderItem[];
}

class TaskOrderItem {
  @IsUUID()
  id: string;

  @IsUUID()
  columnId: string;

  @IsInt()
  order: number;
}