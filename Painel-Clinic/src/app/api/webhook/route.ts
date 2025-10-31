import { NextResponse } from 'next/server'

import axios from 'axios'

import subaccountRepository from '../repositories/subaccount.repository'
import accountRepository from '../repositories/account.repository'
import { Account, Budget } from '../db/models'

async function webhook(req: Request) {
  const headers: any = req.headers

  console.log(' headers', headers.get('asaas-access-token'))

  if (headers.get('asaas-access-token') !== process.env['ASAAS_ACCESS_WEBHOOK_TOKEN'])
    return NextResponse.json({ msg: 'not authorized' }, { status: 200 })

  try {
    const body = await req.json()

    console.log(body)
    const { event, payment } = body
    const { externalReference, status } = payment

     if (
      event !== 'PAYMENT_RECEIVED' &&
      event !== 'PAYMENT_CONFIRMED' &&
      event !== 'PAYMENT_AUTHORIZED'
    ) {
      console.log('Evento ignorado: não é pagamento recebido');
      
      return NextResponse.json({ msg: 'ignorado' }, { status: 200 });
    }

    if (externalReference) {
      const { type } = JSON.parse(externalReference)

      switch (type) {
        case 'create_subaccount':
           
          const { prontdental_asaas_account_id, email } = JSON.parse(externalReference)

          console.log('prontdental_asaas_account_id', prontdental_asaas_account_id)

          const asaasAccount = await subaccountRepository.getById(prontdental_asaas_account_id)

           if (!asaasAccount) {
            console.warn(`Subconta ${prontdental_asaas_account_id} não encontrada. Ignorando evento.`);

            return NextResponse.json({ msg: 'subaccount not found, ignored' }, { status: 200 });
          }

          if (asaasAccount) {
            console.log('asaasAccount', asaasAccount)
            const accountClinic: any = await accountRepository.getById(asaasAccount.accountId);

              if (!accountClinic) {
                 console.warn(`Conta ${asaasAccount.accountId} não encontrada. Ignorando evento.`);
              
                 return NextResponse.json({ msg: 'account not found, ignored' }, { status: 200 });
               }

            console.log(accountClinic);

            console.log('accountClinic[clinic.birthday]', accountClinic['clinic.birthday']);



            const { data } = await axios.post(
              `${process.env.ASAAS_API_URL}/accounts`,
              {
                name: accountClinic?.name,
                email: asaasAccount.email,
                loginEmail: asaasAccount.email,
                phone: accountClinic.cellPhone,
              address: accountClinic.clinic?.street,
              addressNumber: accountClinic.clinic?.address_number,
              province: accountClinic.clinic?.state,
              postalCode: accountClinic.clinic?.cep?.replaceAll('.', '').replaceAll('-', ''),
              cpfCnpj: accountClinic.clinic?.doc_number?.replaceAll('.', '').replaceAll('-', ''),
              birthDate: accountClinic.clinic?.birthday,
                incomeValue: 10000,
                companyType: 'LIMITED'
              },
              {
                headers: {
                  access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
                }
              }
            )

            console.log(data)

            await subaccountRepository.update({
              id: prontdental_asaas_account_id,
              active: true,
              asaas_account_id: data.id,
              wallet_id: data.walletId,
              asaas_api_key: data.apiKey
            })
          }

          break
        default:

        // code block
      }
    }
  } catch (e: any) {
    console.log(e)
    console.log(e.response.data.errors)
  }

  return NextResponse.json({ msg: 'ok' }, { status: 200 })
}

export const POST = webhook
