import 'dotenv/config'

export const config = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_PRONT_USERNAME,
  PASSWORD: process.env.DB_PRONT_PASSWORD,
  DB: process.env.DB_PRONT_DATABASE,
  PORT: process.env.DB_PORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

export const dialect = 'postgres'
