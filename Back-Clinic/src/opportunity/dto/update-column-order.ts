/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';

export class UpdateColumnOrderDtoOpportunity {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderItem)
  columns: ColumnOrderItem[];
}

class ColumnOrderItem {
  @IsUUID()
  id: string;

  @IsInt()
  order: number;
}