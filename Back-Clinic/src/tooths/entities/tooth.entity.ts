import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity';

@Table({
  tableName: 'tooths',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Tooth extends ModelBase {
  @Column
  position: number;

  @Column
  face: string;

  @ForeignKey(() => BudgetItem)
  @Column({
    field: 'budget_item_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  budgetItemId: string;

  @BelongsTo(() => BudgetItem)
  budgetItem: BudgetItem;
}
