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
  tableName: 'prescription',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class Prescription extends ModelBase {
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

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  medicine: string


  @Column
  quantity: number;

  @Column
  measure: string;

  @Column
  dosage: string;

  @Column
  duration: string;

  @Column
  professional: string;

  @Column
  cro: string;

  @Column
  speciality: string;

  @Column({
    field: 'type_cr',
  })
  typeCr: string;

  @Column
  observation: string;

  @Column({
    field: 'secondary_presc_data',
    type: DataType.JSONB,
    allowNull: true,
  })
  secondaryPrescData!: JSON;

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
  
  @Column({ field: 'secret_code', type: DataType.STRING(64), allowNull: true })
  secretCode: string;

  @Column({ field: 'pdf_url', type: DataType.STRING, allowNull: true })
  pdfUrl: string;

  @Column({
    type: DataType.STRING, 
    allowNull: true 
  })
  title: string
}
