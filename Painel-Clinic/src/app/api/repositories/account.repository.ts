import * as argon2 from 'argon2'

import { Account, Clinic, User } from '../db/models'

interface IAccountRepository {
  save(account: Account): Promise<Account>
  retrieveAll(searchParams: { title: string; published: boolean }): Promise<Account[]>
  retrieveById(AccountId: number): Promise<Account | null>
  update(id: string, account: Account): Promise<number>
  delete(accountId: string): Promise<number>
  deleteAll(): Promise<number>
}

class AccountRepository {
  async retrieveAll(searchParams: any): Promise<Account[]> {
    try {
      let accounts = []

      if (searchParams)
        accounts = await Account.findAll({
          attributes: {
            exclude: ['account_id']
          },

          // attributes: [
          //   'id',
          //   'name',
          //   'description',
          //   'active',
          //   'consultation_time',
          //   'cell_phone',
          //   'hourly',
          //   'type',
          //   'balancer'
          // ],
          where: searchParams,
          order: [
            ['users', 'created_at', 'asc'],
            ['updated_at', 'DESC']
          ],
          include: [
            {
              model: User,
              attributes: ['email']
            },
            {
              model: Clinic,
              attributes: ['doc_number']
            }
          ]
        })
      else
        accounts = await Account.findAll({
          order: [['updated_at', 'DESC']],
          include: [
            {
              model: User,
              attributes: ['email']
            },
            {
              model: Clinic,
              attributes: ['doc_number']
            }
          ]
        })

      return JSON.parse(JSON.stringify(accounts));
    } catch (e) {
      console.error(e)

      return [];
    }
  }

 async getById(id: string): Promise<any | null> {
    try {

      const account = await Account.findByPk(id, {
        attributes: ['id', 'name', 'idSeq', 'description', 'active', 'consultationTime', 'cellPhone', 'hourly', 'type', 'balancer', 'lastSession'],
        include: [
          {
            model: User,
            attributes: ['email']
          }
        ],
        raw: true,
        nest: true
      })

      if (!account) return null

      const idSeq = account.idSeq

      if (!idSeq) return account

      const schemaName = `${process.env.NAME_SCHEMA_CLIENT}${idSeq}`

      const clinicModel = Clinic.schema(schemaName);

      const clinic = await clinicModel.findOne({
        where: { accountId: account.id },
        attributes: ['doc_number', 'cep', 'street', 'address_number', 'neighborhood', 'city', 'state', 'birthday'],
        raw: true
      })

      console.log("clinic-----", clinic);


      return {
        ...account,
        clinic
      }
    } catch (e) {
      console.error(e)

return null
    }
  }

  async update(accountId: string, account: Account): Promise<number> {
    console.log('account', account)
    await Account.update(account, { where: { id: accountId } })

    return 1
  }
}

export default new AccountRepository()
