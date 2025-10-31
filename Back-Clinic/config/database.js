module.exports = {
  development: {
    username: process.env.DB_PRONT_USERNAME,
    password: process.env.DB_PRONT_PASSWORD,
    database: process.env.DB_PRONT_DATABASE,
    host: process.env.DB_PRONT_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl:
        process.env.DB_PRONT_SSL === 'true'
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  },
};
