/* eslint-disable prettier/prettier */
import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Professional } from 'src/professionals/entities/professional.entity';

@Table({ 
    tableName: 'digital_certificate', 
    createdAt: 'createdAt',
    updatedAt: 'updatedAt', 
})
export class DigitalCertificate extends ModelBase {
  
  @ForeignKey(() => Professional)
  @Column({
    type: DataType.UUID,
    allowNull: false, 
  })
  professionalId: string;

  @BelongsTo(() => Professional)
  professional: Professional;

  @Column({
    type: DataType.BLOB, 
    allowNull: false,
  })
  certificateFile: Buffer;

  @Column({
    type: DataType.STRING, 
    allowNull: false,
  })
  password: string;
}
