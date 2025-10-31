/* eslint-disable prettier/prettier */
import { Table, Column, Model, PrimaryKey, Default, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'contract_signature', 
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class ContractSignature extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4) 
  @Column({
    type: DataType.UUID, 
    defaultValue: DataType.UUIDV4, 
  })
  id: string;

  @Column({
    type: DataType.INTEGER, 
    autoIncrement: true,   
    primaryKey: true       
  })
  idSeq: number;

  @Column
  numberOfSigners: number;

  @Column
  date: Date; 

  @Column
  time: string; 

  @Column({
    type: DataType.ENUM('pending', 'completed', 'canceled'), 
  })
  status: 'pending' | 'completed' | 'canceled'; 

  @Column({
    type: DataType.UUID, 
    allowNull: true, 
  })
  signer1Id: string; 

  @Column({
    type: DataType.UUID, 
    allowNull: true, 
  })
  signer2Id: string; 

  @Column({
    type: DataType.UUID,
    allowNull: false, 
  })
  documentId: string;

  @Column
  documentType: string; 

  @Column
  hashDoc: string;

  @Column({
    allowNull: true
  })
  hashSigner1: string;

  @Column({
    allowNull: true
  })
  hashSigner2: string;
}
