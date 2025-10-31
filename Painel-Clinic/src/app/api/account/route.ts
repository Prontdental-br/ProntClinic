import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import axios from 'axios'

import { Op } from 'sequelize'

import accountRepository from '../repositories/account.repository'
import authMiddleware from '../middleware/authMiddleware'

async function getRoute(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url || '')
    const name = searchParams.get('name')
    const userAccounts = await accountRepository.retrieveAll(name ? { name: { [Op.like]: `%${name}%` } } : {})

    /*
    const resp = await axios.get(`${process.env.ASAAS_API_URL}/customers`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    const customersEmails: any = {}

    console.log('customers',resp.data)

    resp.data.data.forEach((c: any) => {
      customersEmails[c.email] = { ...c }
    })

    const userEmails: any = {}

    userAccounts.forEach((u: any) => {
      if (u.users[0] && u.users[0].email && customersEmails[u.users[0].email]){
        console.log(customersEmails[u.users[0].email].observations)
        userEmails[u.users[0].email] = {
          ...u,
          asaas_id: customersEmails[u.users[0].email].id,
          plan: customersEmails[u.users[0].email].observations
            ? (JSON.parse(customersEmails[u.users[0].email].observations))['plan']
            : 'Standard'
        }
      }
    })

    const users = Object.values(userEmails)

    const userAsaasIds: any = {}

    users.forEach((u: any) => {
      if (u.asaas_id) userAsaasIds[u.asaas_id] = { ...u, email: u.users[0].email }
    })

    const { data } = await axios.get(`${process.env.ASAAS_API_URL}/payments`, {
      headers: {
        access_token: `$aact_${process.env.ASAAS_API_TOKEN}`
      }
    })

    let charges = data.data

    charges = charges.map((c: any) =>
      Object.assign({ ...userAsaasIds[c.customer], status: c.status, dueDate: c.dueDate, value: c.value })
    )

    charges = charges.filter((c: any) => c.id)

    const chargeAsaasIds: any = {}
    const chargeEmails: any = {}

    const seen = new Set();


    charges = charges.filter((item: any) => {
      const duplicate = seen.has(item['email']);

      seen.add(item['email']);
      
      return !duplicate;
    });

    charges.forEach((c: any) => {
      chargeAsaasIds[c.asaas_id] = { ...c }
      chargeEmails[c.email] = { ...c }
    })

    userAccounts = userAccounts.filter((u: any) => !chargeEmails[u.users[0]?.email])
    */

    return NextResponse.json([...userAccounts], { status: 200 })
  } catch (e) {
    console.log(e)

    return NextResponse.json(e)
  }
}

export const GET = authMiddleware(getRoute)
