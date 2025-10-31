import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { ModelBase } from 'src/base/entities/ModelBase';
import { Patient } from 'src/patients/entities/patient.entity';

@Table({
  tableName: 'contract',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Contract extends ModelBase {
  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => Patient)
  @Column({
    field: 'patient_id',
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  patientId: string;

  @Column
  code: string;

  @Column
  title: string;

  @Column({
    type: DataType.TEXT, 
  })
  text: string;

  @Column
  professional: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  date: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  time: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isSigned: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fontFamily: string;

  @Column({
    type: DataType.STRING, 
    allowNull: true,
  })
  imgSignature: string;
}
