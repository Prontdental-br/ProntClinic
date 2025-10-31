import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import axios from 'axios'
import dayjs from 'dayjs'

import authMiddlewareV2 from '../middleware/authMiddlewareV2'
import { Account, AsaasAccount, Budget, Patient, SchemasReference, sequelize, Transaction } from '../db/models'
import createOrUpdateWebhook from '../webhook/utils/createOrUpdateWebhook'
import authMiddleware from '../middleware/authMiddleware'

const paymentTypes: any = {
  credito: 'CREDIT_CARD',
  debito: 'CREDIT_CARD',
  boleto: 'BOLETO',
  pix: 'PIX'
}

function getDateToday() {
  const today = new Date()
  const futureDate = new Date(today)

  futureDate.setDate(today.getDate())

  const year = futureDate.getFullYear()
  const month = String(futureDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(futureDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function fetchInParallel(data: any) {
  const promises = data.map(async (item: any) => {
    try {
      const response = await axios.get(`${process.env.ASAAS_API_URL}/customers/${item.customer}`, {
        headers: {
          access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
        }
      })

      return { ...item, name: response.data.name, email: response.data.email }
    } catch (error) {
      console.error(`Erro na requisição para o item ${item.id}:`, error)

      return { ...item, responseData: null }
    }
  })

  const updatedData = await Promise.all(promises)

  return updatedData
}

async function getRoute(req: NextRequest) {
  try {
    const { data } = await axios.get(`${process.env.ASAAS_API_URL}/payments`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let charges = data.data

    charges = await fetchInParallel(charges)

    return NextResponse.json([...charges], { status: 200 })
  } catch (e) {
    console.log(e)

    return NextResponse.json(e)
  }
}

export const GET = authMiddleware(getRoute)

interface AddChargeBody {
  id: string
  paymentType: string
  value: number
  installmentCount: number
  dueDate: string
  transactionId: string
}

async function getOrCreateAsaasCustomer(asaasAccount: any, patient: any): Promise<string> {
  const { asaas_api_key } = asaasAccount

  // Buscar cliente existente
  const { data: existingCustomer } = await axios.get(`${process.env.ASAAS_API_URL}/customers`, {
    headers: { access_token: asaas_api_key },
    params: { email: patient.email, cpfCnpj: patient.cpf.replace(/\D/g, '') }
  })

  if (existingCustomer.data.length > 0) return existingCustomer.data[0].id

  // Criar novo cliente
  const { data: newCustomer } = await axios.post(
    `${process.env.ASAAS_API_URL}/customers`,
    {
      externalReference: patient.id,
      name: patient.name,
      cpfCnpj: patient.cpf.replace(/\D/g, ''),
      email: patient.email
    },
    { headers: { access_token: asaas_api_key } }
  )

  return newCustomer.id
}

async function createInstallments(params: {
  transactionModel: any
  budget: any
  value: number
  installmentCount: number
  dueDate: string
  transactionId: string
  accountId: string
  idSeq: number
  transaction: any
}) {
  const { transactionModel, budget, value, installmentCount, dueDate, transactionId, accountId, idSeq, transaction } =
    params

  const installmentValue = parseFloat((value / installmentCount).toFixed(2))
  const parcelaTransactions: any[] = []

  for (let i = 1; i <= installmentCount; i++) {
    const parcela = await transactionModel.create(
      {
        accountId,
        description: `${budget.description} - Parcela ${i}/${installmentCount}`,
        value: installmentValue,
        type: 'R',
        dueDate: dayjs(dueDate)
          .add(i - 1, 'month')
          .toDate(),
        referenceDate: dayjs(dueDate)
          .add(i - 1, 'month')
          .toDate(),
        parent: transactionId,
        isPaid: false,
        entityId: budget.id
      },
      { transaction }
    )

    await SchemasReference.create(
      {
        accountId,
        id_reference: parcela.id,
        id_schema: idSeq,
        type: 'transactions'
      } as SchemasReference,

      { transaction }
    )

    parcelaTransactions.push(parcela)
  }

  return parcelaTransactions
}

async function createAsaasPayment(
  asaasAccount: any,
  budget: any,
  customerId: string,
  value: number,
  paymentType: string,
  installmentCount: number,
  transactionId: string,
  dueDate: string
) {
  const { asaas_api_key } = asaasAccount

  const { data: payment } = await axios.post(
    `${process.env.ASAAS_API_URL}/payments`,
    {
      customer: customerId,
      billingType: paymentTypes[paymentType] || 'BOLETO',
      value,
      dueDate,
      installmentCount,
      totalValue: value,
      description: budget.description,
      externalReference: JSON.stringify({
        type: 'charge',
        parentTransactionId: transactionId
      })
    },
    { headers: { access_token: asaas_api_key } }
  )

  return payment
}

async function addCharge(req: any) {
  const t = await sequelize.transaction()

  try {
    const body: any = await req.json()
    const { id, paymentType, value, installmentCount, dueDate, transactionId } = body

    const accountId = req['user']['accountId']

    if (!id || !value || !dueDate || !transactionId || !accountId) {
      await t.rollback()

      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const account = await Account.findOne({ where: { id: accountId }, attributes: ['idSeq'], raw: true })

    if (!account) {
      await t.rollback()

      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${account.idSeq}`
    const transactionModel = Transaction.schema(schemaName)
    const budgetModel = Budget.schema(schemaName)
    const patientModel = Patient.schema(schemaName)

    const budget = await budgetModel.findOne({
      where: { id },
      include: [{ model: patientModel, attributes: ['id', 'name', 'cpf', 'email'] }],
      transaction: t
    })

    if (!budget) {
      await t.rollback()

      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    // const existingParcels = await transactionModel.count({ where: { parent: transactionId }, transaction: t })

    // if (existingParcels > 0) {
    //   await t.rollback()

    //   return NextResponse.json({ error: 'Cobrança já gerada' }, { status: 400 })
    // }

    const asaasAccount = await AsaasAccount.findOne({ where: { accountId }, raw: true })

    if (!asaasAccount) {
      await t.rollback()

      return NextResponse.json({ error: 'Conta Asaas não configurada' }, { status: 400 })
    }

    const customerId = await getOrCreateAsaasCustomer(asaasAccount, budget.patient)

    await createOrUpdateWebhook(asaasAccount.asaas_api_key, asaasAccount.email)

    let parcelaTransactions: any[] = []

    if (installmentCount > 1) {
      parcelaTransactions = await createInstallments({
        transactionModel,
        budget,
        value,
        installmentCount,
        dueDate,
        transactionId,
        accountId,
        idSeq: account.idSeq,
        transaction: t
      })

      await transactionModel.update({ isParent: true }, { where: { id: transactionId }, transaction: t })
    }

    const payment = await createAsaasPayment(
      asaasAccount,
      budget,
      customerId,
      value,
      paymentType,
      installmentCount,
      transactionId,
      dueDate
    )

    await t.commit()

    return NextResponse.json(
      { invoiceUrl: payment.invoiceUrl, parcelasCriadas: parcelaTransactions.length },
      { status: 200 }
    )
  } catch (e: any) {
    await t.rollback()
    console.error('Erro ao criar cobrança parcelada:', e)

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

const internalAddCharge = addCharge

export const POST = authMiddlewareV2(internalAddCharge)
