/* eslint-disable prettier/prettier */
import { IsArray, IsUUID, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MoveTaskDtoOpportunity {
  @IsUUID()
  columnId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOrder)
  tasks: TaskOrder[];
}

class TaskOrder {
  @IsUUID()
  id: string;

  @IsInt()
  order: number;
}
