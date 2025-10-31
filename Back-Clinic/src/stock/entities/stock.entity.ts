import { Column, DataType, Table } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'stock',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Stock extends ModelBase {
  @Column
  category: string;

  @Column
  unitOfMeasure: string;

  @Column
  quantity: number;

  @Column
  productName: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  price: number;

  @Column
  supplier: string;

  @Column
  expiryDate: Date;

  @Column
  manufacturer: string;

  @Column
  manufactureDate: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  sellingPrice: number;

  @Column
  storageLocation: string;

  @Column
  batch: string;

  @Column
  storage: string;

  @Column
  status: number;

  @Column
  observation: string;

  @Column
  minimumquantityalert: string;

  @Column({ 
    type: DataType.BOOLEAN, 
    defaultValue: true 
  })
  active: boolean;
}
