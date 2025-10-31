'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [schemas] = await queryInterface.sequelize.query(`
      SELECT nspname
      FROM pg_catalog.pg_namespace
      WHERE nspname LIKE '%prontclinic%' OR nspname = 'public';
    `);

    for (const schema of schemas) {
      const schemaName = schema.nspname;

      console.log(
        `📌 Criando tabela 'financial_chart_accounts' no schema '${schemaName}'...`,
      );

      const [tableExists] = await queryInterface.sequelize.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
          AND table_name = 'financial_chart_accounts';
      `);

      if (tableExists.length > 0) {
        console.warn(
          `⚠️ A tabela 'financial_chart_accounts' já existe no schema '${schemaName}', pulando...`,
        );
        continue;
      }

      await queryInterface.createTable(
        { tableName: 'financial_chart_accounts', schema: schemaName },
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
          },
          account_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          code: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          type: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          level: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          operation_type: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          parent_id: {
            type: Sequelize.UUID,
            allowNull: true,
          },
          active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          created_user_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          updated_user_id: {
            type: Sequelize.UUID,
            allowNull: false,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('now'),
          },
        },
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const [schemas] = await queryInterface.sequelize.query(`
      SELECT nspname
      FROM pg_catalog.pg_namespace
      WHERE nspname LIKE '%prontclinic%' OR nspname = 'public';
    `);

    for (const schema of schemas) {
      const schemaName = schema.nspname;
      console.log(
        `🔁 Removendo tabela 'financial_chart_accounts' do schema '${schemaName}'...`,
      );

      await queryInterface.dropTable({
        tableName: 'financial_chart_accounts',
        schema: schemaName,
      });
    }
  },
};
