import { NextResponse } from 'next/server'

import axios from 'axios'

import authMiddleware from '../middleware/authMiddleware'
import accountRepository from '../repositories/account.repository'
import subaccountRepository from '../repositories/subaccount.repository'

function getDateAfterTenDays() {
  const today = new Date()
  const futureDate = new Date(today)

  futureDate.setDate(today.getDate() + 10)

  const year = futureDate.getFullYear()
  const month = String(futureDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(futureDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function addSubaccount(req: Request) {
  try {
    const body = await req.json()

    console.log(body)
    const { accountId, email, billingType, plan, dueDate } = body

    const account: any = await accountRepository.getById(accountId)

    console.log(account)

    const { data } = await axios.get(`${process.env.ASAAS_API_URL}/customers?email=${email}`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let customer_id

    if (data.data.length === 0) {
      const { data } = await axios.post(
        `${process.env.ASAAS_API_URL}/customers`,
        {
          externalReference: account.id,
          name: account.name,
          cpfCnpj: account.clinic?.doc_number?.replaceAll('.', '')?.replaceAll('-', '') || '',
          email: email,
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

    console.log(customer_id)
    let resp = await axios.get(`${process.env.ASAAS_API_URL}/payments?customer=${customer_id}?status=PENDING`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let payment
    let subAccount

    console.log('account',account);

    subAccount = await subaccountRepository.getAll({ accountId: account.id })

    console.log('subAccount', subAccount)

    if (!subAccount[0])
      subAccount = await subaccountRepository.save({
        accountId: account.id,
        email
      })
    else subAccount = subAccount[0]

    console.log('subAccount', subAccount)

    if (resp.data.data.length === 0 || (resp.data.data[0] && resp.data.data[0].status === 'RECEIVED')) {
      resp = await axios.post(
        `${process.env.ASAAS_API_URL}/payments`,
        {
          customer: customer_id,
          billingType: 'CREDIT_CARD',
          value: 9.9,
          dueDate: dueDate || getTodayDate(),

          //daysAfterDueDateToRegistrationCancellation: 1,
          description: `Não Recebemos Pagamento em Cheque
            Pagamento referente à taxa de criação de subconta.
            `,
          externalReference: JSON.stringify({
            type: 'create_subaccount',
            prontdental_asaas_account_id: subAccount.id
          })
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

    return NextResponse.json({ invoiceUrl: payment.invoiceUrl }, { status: 200 })
  } catch (e) {
    console.log('error', e)

    return NextResponse.json({ e }, { status: 500 })
  }
}

export const POST = addSubaccount
