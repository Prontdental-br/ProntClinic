/* eslint-disable prettier/prettier */
import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({ 
    tableName: 'score_plan_payments',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})
export class ScorePlanPayment extends Model<ScorePlanPayment> {
    @PrimaryKey
    @Column({ 
      type: DataType.UUID, 
      defaultValue: DataType.UUIDV4 
    })
    id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  accountId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  paymentId: string; // ID do pagamento gerado no momento que gera o boleto

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  custumerId: string; // ID do cadastro da pessoa no Asaas (pagador)

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  value: number; // Valor do pagamento

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  generationDate: Date; // Data de geração do pagamento

  @Column({
    type: DataType.DATE,
    allowNull: false,
  }) 
  expirationDate: Date; // Data de vencimento do pagamento

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  paymentDate: Date; // Data de pagamento (opcional, pois pode não ter sido pago ainda)

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  numberOfConsultations: number; // Quantidade de consultas adquiridas

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string; // Status do pagamento (pago, pendente, cancelado, etc.)
}
