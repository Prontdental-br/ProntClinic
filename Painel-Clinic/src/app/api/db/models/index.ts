import { Sequelize } from 'sequelize-typescript'
import pg from 'pg'
import * as argon2 from 'argon2'

import { config, dialect } from '../db.config'
import AdminUser from './AdminUser.model'
import User from './User.model'
import { Account } from './Account.model'
import { Clinic } from './Clinic.Model'
import AsaasAccount from './AsaasAcount'
import Budget from './Budget'
import Patient from './Patient'
import { Payment } from './Payment'
import Whatsapp from './Whatsapp'
import { Transaction } from './Transactions.model'
import { PromotionalCode } from './PromotionalCode.model'
import { SchemasReference } from './SchemasReferences.model'
import { MigrationDataControl } from './MigrationDataControl.model'

console.log('[DB CONFIG-----------]', {
  HOST: config.HOST,
  PORT: config.PORT,
  USER: config.USER,
  DB: config.DB,
  SSL: process.env.DB_PRONT_SSL
})

const sslEnabled = ['true', '1', 'yes'].includes(String(process.env.DB_PRONT_SSL).toLowerCase())

const sequelize = new Sequelize(config.DB || '', config.USER || '', config.PASSWORD || '', {
  host: config.HOST,
  port: parseInt(config.PORT || '0'),
  dialect: dialect,
  dialectModule: pg,
  dialectOptions: {
    ssl: sslEnabled
      ? {
          require: true,
          rejectUnauthorized: false
        }
      : false
  },
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle
  },
  logging: console.log
})

sequelize.addModels([
  AdminUser,
  User,
  Account,
  Clinic,
  AsaasAccount,
  Budget,
  Patient,
  Payment,
  Whatsapp,
  Transaction,
  PromotionalCode,
  SchemasReference,
  MigrationDataControl
])

const initDB = async () => {
  await sequelize.authenticate()
}

const seed = async () => {
  const user = await AdminUser.findOne({ where: { email: 'admin@mail.com' } })
  const hash = await argon2.hash('12345678a')

  if (!user)
    await AdminUser.create({
      name: 'Admin',
      email: 'admin@mail.com',
      role: 'admin',
      password: hash
    })
}

export {
  sequelize,
  initDB,
  seed,
  AdminUser,
  User,
  Account,
  Clinic,
  AsaasAccount,
  Budget,
  Patient,
  Payment,
  Whatsapp,
  Transaction,
  PromotionalCode,
  SchemasReference,
  MigrationDataControl
}
