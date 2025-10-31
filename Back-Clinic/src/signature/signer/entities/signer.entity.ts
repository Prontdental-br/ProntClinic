/* eslint-disable prettier/prettier */
import { Table, Column, DataType } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';

@Table({
  tableName: 'signers', 
})
export class Signer extends ModelBase {
  @Column({
    type: DataType.UUID, 
    allowNull: true, 
  })
  clinicId: string;

  @Column({
    type: DataType.INTEGER, 
    autoIncrement: true,   
    primaryKey: true       
  })
  idSeq: number;

  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  signerId: string; 

  @Column({
    allowNull: true
  })
  council: string; 

  @Column({
    allowNull: true
  })
  numberConcil: number;

  @Column
  isProfessional: boolean;

  @Column
  name: string; 

  @Column({
    allowNull: true
  })
  email: string;

  @Column
  cpf: string;

  @Column
  date: Date; 

  @Column
  time: string;

  @Column
  hash: string;
}
