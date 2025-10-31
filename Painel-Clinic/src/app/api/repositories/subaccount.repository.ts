import { AsaasAccount } from '../db/models'

class SubaccountRepository {
  async save(subaccount: any): Promise<any> {
    const account = await AsaasAccount.create({ ...subaccount })

    return account.toJSON();
  }

  async update(subaccount: any): Promise<any> {
    const id = subaccount.id

    delete subaccount.id
    const account = await AsaasAccount.update({ ...subaccount }, { where: { id } })

    return account
  }

  async getAll(query: any): Promise<any | null> {
    try {
      const account = await AsaasAccount.findAll({where: query, raw: true})

      return account;
    } catch (e) {}
  }

  async getById(id: string): Promise<any | null> {
    try {
      const account = await AsaasAccount.findByPk(id)

      return account?.toJSON();
    } catch (e) {}
  }
}

export default new SubaccountRepository()
