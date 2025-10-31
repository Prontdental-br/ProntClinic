import * as argon2 from 'argon2'
import { Sequelize } from 'sequelize-typescript'
import { Op } from 'sequelize'

import { AdminUser } from '../db/models'

interface IAdminUserRepository {
  save(adminUser: AdminUser): Promise<AdminUser>
  retrieveAll(searchParams: { title: string; published: boolean }): Promise<AdminUser[]>
  retrieveById(AdminUserId: number): Promise<AdminUser | null>
  update(id: string, adminUser: AdminUser): Promise<number>
  delete(adminUserId: string): Promise<number>
  deleteAll(): Promise<number>
}

class AdminUserRepository {
  async save(adminUser: AdminUser): Promise<AdminUser> {
    const hash = await argon2.hash(adminUser.password)
    const user = await AdminUser.create({ ...adminUser, password: hash })

    console.log(user)

    return user
  }

  async retrieveAll(searchParams: any): Promise<AdminUser[]> {
    try {
      let users = []

      if (searchParams) users = await AdminUser.findAll({ where: searchParams })
      else users = await AdminUser.findAll()

      return users
    } catch (e) {
      console.error(e);

      return [];
    }
  }

  async getById(id: string): Promise<AdminUser | null> {
    try {
      const user = await AdminUser.findByPk(id, { raw: true })

      console.log(user)

      return user
    } catch (e) {
      console.error(e)

      return null;
    }
  }

  async home() {
    const roles: any = ['admin', 'dev', 'finance', 'support', 'seller']

    const result = await AdminUser.findAll({
      attributes: ['role', [Sequelize.fn('COUNT', Sequelize.col('role')), 'count']],
      where: {
        role: {
          [Op.in]: roles
        }
      },
      group: ['role']
    })

    const countsByRole: any = {}

    roles.forEach((role: string) => {
      const roleCount = result.find(item => item.role === role)

      countsByRole[role] = roleCount ? roleCount.get('count') : 0
    })

    return countsByRole
  }


  async update(adminUserId: string, adminUser: AdminUser): Promise<number> {
    console.log(adminUser)

    if(adminUser.password){
      const hash = await argon2.hash(adminUser.password);

      adminUser.password = hash;
    }

    await AdminUser.update(adminUser, { where: { id: adminUserId } })

    return 1;
  }

  async delete(adminUserId: string): Promise<number> {
    return await AdminUser.destroy({
      where: {
        id: adminUserId
      }
    })
  }
}

export default new AdminUserRepository()
