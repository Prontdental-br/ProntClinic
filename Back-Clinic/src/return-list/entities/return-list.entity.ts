import { 
  Table, 
  Column, 
  DataType, 
  ForeignKey, 
  BelongsTo 
} from 'sequelize-typescript'
import { ModelBase } from 'src/base/entities/ModelBase'
import { BudgetItem } from 'src/budget-items/entities/budget-item.entity'
import { Patient } from 'src/patients/entities/patient.entity'

@Table({
  tableName: 'return_list',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class ReturnList extends ModelBase {

  @ForeignKey(() => Patient)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'patient_id'
  })
  patientId!: string

  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => BudgetItem)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'treatment_id'
  })
  treatmentId!: string

  @BelongsTo(() => BudgetItem)
  treatment: BudgetItem;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'start_date'
  })
  startDate!: Date

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'return_value'
  })
  returnValue!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'return_type'
  })
  returnType!: string;

  @Column({
    type: DataType.ENUM('pending', 'confirmed', 'lost'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status!: 'pending' | 'confirmed' | 'lost';

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_created' })
  userCreated: string;

  @Column({ type: DataType.UUID, allowNull: true, field: 'user_updated' })
  userUpdated: string;
}
