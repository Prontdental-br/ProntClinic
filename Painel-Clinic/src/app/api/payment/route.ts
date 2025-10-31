import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import axios from 'axios'

import accountRepository from '../repositories/account.repository'
import authMiddleware from '../middleware/authMiddleware'

function getDateAfterTenDays() {
  const today = new Date()
  const futureDate = new Date(today)

  futureDate.setDate(today.getDate() + 10)

  const year = futureDate.getFullYear()
  const month = String(futureDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(futureDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const plans: any = {
  Standard: 139,
  Premium: 249
}

async function addBill(req: Request) {
  const { searchParams } = new URL(req.url || '')

  try {
    const body = await req.json()
    const { userId, email, billingType, plan, dueDate } = body

    const { data } = await axios.get(`${process.env.ASAAS_API_URL}/customers?email=${email}`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let customer_id

    const account: any = await accountRepository.getById(userId)

    console.log(account)

    if (data.data.length === 0) {
      const { data } = await axios.post(
        `${process.env.ASAAS_API_URL}/customers`,
        {
          externalReference: account.id,
          name: account.name,
          cpfCnpj: account['clinic.doc_number'].replaceAll('.', '').replaceAll('-', ''),
          email,
          observations: JSON.stringify({ plan: plan || 'Standard' })
        },
        {
          headers: {
            access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
          }
        }
      )

      customer_id = data.id
    } else {
      customer_id = data.data[0].id
    }

    let resp = await axios.get(`${process.env.ASAAS_API_URL}/payments?customer=${customer_id}`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let payment

    if (
      resp.data.data.length === 0 ||
      (resp.data.data[0] && (resp.data.data[0].status === 'RECEIVED' || resp.data.data[0].status === 'CONFIRMED'))
    ) {
      resp = await axios.post(
        `${process.env.ASAAS_API_URL}/payments`,
        {
          customer: customer_id,
          billingType: billingType || 'BOLETO',
          value: plans[plan],
          dueDate: dueDate || getDateAfterTenDays(),
          daysAfterDueDateToRegistrationCancellation: 1,
          description: `Não Recebemos Pagamento em Cheque
          Pagamento referente à assinatura do Software Clairis, conforme contrato de prestação de serviços.
          Boleto com vencimento no final de semana, poderá ser pago próximo dia útil.`
        },
        {
          headers: {
            access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
          }
        }
      )
      payment = resp.data
    } else {
      payment = resp.data.data[0]
    }

    console.log(payment)

    return NextResponse.json({ invoiceUrl: payment.invoiceUrl }, { status: 200 })
  } catch (e: any) {
    console.log(e.response.data.errors)

    return NextResponse.json(e)
  }
}

export const POST = authMiddleware(addBill)

async function getBill(req: NextApiRequest) {
  try {
    const { searchParams } = new URL(req.url || '')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    const { data } = await axios.get(`${process.env.ASAAS_API_URL}/customers?email=${email}`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let customer_id

    const account: any = await accountRepository.getById(userId || '')

    console.log(data, account)

    if (data.data.length === 0) {
      console.log('data.data', data.data)

      const resp = await axios.post(
        `${process.env.ASAAS_API_URL}/customers`,
        {
          name: account.name,
          cpfCnpj: account['clinic.doc_number'].replaceAll('.', '').replaceAll('-', ''),
          email
        },
        {
          headers: {
            access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
          }
        }
      )

      customer_id = resp.data.id
    } else {
      console.log('data.data', data.data)
      customer_id = data.data[0].id
    }

    const resp = await axios.get(`${process.env.ASAAS_API_URL}/payments?customer=${customer_id}`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    console.log(resp.data.data[0])
    const payment = resp.data.data[0]

    const respStatus = await axios.get(`${process.env.ASAAS_API_URL}/payments/${resp.data.data[0]?.id}/status`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    console.log(respStatus.data)
    console.log(payment)

    return NextResponse.json(
      {
        invoiceUrl: payment?.invoiceUrl,
        payStatus: respStatus.data.status,
        value: payment?.value,
        dueDate: payment?.dueDate,
        transactionReceiptUrl: payment.transactionReceiptUrl
      },
      { status: 200 }
    )
  } catch (e: any) {
    console.log(e.response.data.errors)

    return NextResponse.json(e)
  }
}

export const GET = authMiddleware(getBill)
