import { NextResponse } from 'next/server'

import axios from 'axios'

import subaccountRepository from '../repositories/subaccount.repository'

import accountRepository from '../repositories/account.repository'

import { Account, Budget, Payment, SchemasReference, Transaction } from '../db/models'

const paymentTypeMap: Record<string, string> = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Crédito',
  PIX: 'Pix',
  TRANSFER: 'Transferência',
  DEBIT_CARD: 'Débito',
  MONEY: 'Dinheiro',
  UNDEFINED: 'Desconhecido'
}

function convertToBrazilTime(dateString: string): string {
  const date = new Date(dateString)

  date.setHours(date.getHours() + 3) // adiciona 3 horas

  return date.toISOString()
}

async function webhook(req: Request) {
  try {
    const body = await req.json()
    const { payment } = body
    const { externalReference } = payment

    const { type, parentTransactionId } = JSON.parse(externalReference || '{}')

    if (type !== 'charge') {
      return NextResponse.json({ msg: 'Tipo de evento não tratado' }, { status: 200 })
    }

    const schemaRef = await SchemasReference.findOne({
      where: {
        id_reference: parentTransactionId,
        type: 'transactions'
      },
      raw: true
    })

    if (!schemaRef?.id_schema) {
      console.error('Schema Reference não encontrado')

      return NextResponse.json({ error: 'Schema não encontrado' }, { status: 404 })
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${schemaRef.id_schema}`
    const transactionModel = Transaction.schema(schemaName)

    const parentTransaction = await transactionModel.findOne({
      where: { id: parentTransactionId },
      raw: false
    })

    if (!parentTransaction) {
      console.warn(`Transação ${parentTransactionId} não encontrada`)

      return NextResponse.json({ msg: 'Transação não encontrada' }, { status: 404 })
    }

    if (parentTransaction.isParent) {
      const nextInstallment = await transactionModel.findOne({
        where: { parent: parentTransactionId, isPaid: false },
        order: [['dueDate', 'ASC']]
      })

      if (!nextInstallment) {
        console.warn(`Nenhuma parcela pendente encontrada para parent: ${parentTransactionId}`)

        return NextResponse.json({ msg: 'Nenhuma parcela pendente' }, { status: 200 })
      }

      const mappedPaymentType = paymentTypeMap[payment.billingType] || 'Outro'
      const brazilPaymentDate = convertToBrazilTime(payment.clientPaymentDate)

      await nextInstallment.update({
        paymentDate: brazilPaymentDate,
        paymentType: mappedPaymentType,
        isPaid: true
      })

      const remaining = await transactionModel.count({
        where: { parent: parentTransactionId, isPaid: false }
      })

      if (remaining === 0) {
        await parentTransaction.update({ isPaid: true })
      }
    } else {
      const mappedPaymentType = paymentTypeMap[payment.billingType] || 'Outro'
      const brazilPaymentDate = convertToBrazilTime(payment.clientPaymentDate)

      await parentTransaction.update({
        paymentDate: brazilPaymentDate,
        paymentType: mappedPaymentType,
        isPaid: true
      })
    }

    return NextResponse.json({ msg: 'Pagamento processado com sucesso' }, { status: 200 })
  } catch (e: any) {
    console.error('Erro no webhook:', e)

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export const POST = webhook
