import {
  Column,
  DataType,
  Table,
  ForeignKey,
  Model,
} from 'sequelize-typescript';
import { Patient } from 'src/patients/entities/patient.entity';

@Table({
  tableName: 'score_consultations',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
})
export class ScoreConsultation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  patientId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  accountId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  documentFormatted: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  creditScoreD00: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  creditScoreD30: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  creditScoreD60: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  incomePersonal: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  incomePartner: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  incomeFamily: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  incomePersonalClass: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  incomeFamilyClass: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  formattedNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address: string;
}
