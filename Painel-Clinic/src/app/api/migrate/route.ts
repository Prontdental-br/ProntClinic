// pages/api/migration/index.ts
import { NextResponse } from 'next/server'

import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'

import { MigrationDataControl, sequelize } from '../db/models'
import authMiddleware from '../middleware/authMiddleware'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

const tableMap: Record<string, string> = {
  Dentist: 'dentist_clinicorp_arq',
  Patient: 'patient_clinicorp_arq',
  Tabela: 'treatments_clinicorp_arq',
  Appointment: 'appointment_clinicorp_arq',
  TreatmentOperation: 'treatmentoperation_clinicorp_arq',
  PaymentHeader: 'paymentheader_clinicorp_arq',
  PaymentItem: 'paymentitem_clinicorp_arq',
  Anamnesis: 'anamnesis_clinicorp_arq',
  PatientAnamnesis: 'patientanamnesis_clinicorp_arq',
  AnamnesisQuestions: 'anamnesisquestions_clinicorp_arq'
}

// async function createMigration(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     try {
//       const form = formidable({ multiples: true });

//       const { fields, files }: any = await new Promise((resolve, reject) => {
//         form.parse(req, (err: any, fields: any, files: any) => {
//           if (err) reject(err);
//           resolve({ fields, files });
//         });
//       });

//       const accountId = fields.accountId as string;
//       const accountName = fields.accountName as string;
//       const userId = fields.userId as string;
//       const idSeq = fields.idSeq as string;

//       const migrationId = uuidv4();

//       console.log('CHEGOU AQUI----')

//       await MigrationDataControl.create({
//         id: migrationId,
//         accountId,
//         name: accountName,
//         status: 'loaded',
//         statusDiagnostic: null,
//         createdUserId: userId,
//         updatedUserId: userId,
//       });

//       for (const key of Object.keys(files)) {
//         const file = Array.isArray(files[key]) ? files[key][0] : files[key];
//         const baseName = key.replace(/\d+$/, '');
//         const tableName = tableMap[baseName];

//         if (!tableName) continue;

//         const workbook = XLSX.readFile(file.filepath);
//         const sheetName = workbook.SheetNames[0];
//         const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         if (jsonData.length > 0) {
//           await sequelize.getQueryInterface().bulkInsert(
//             { tableName, schema: 'db_import_clinicorp' },
//             jsonData.map((row: any) => ({
//               ...row,
//               account_id: accountId,
//               migration_data_control_id: migrationId,
//             }))
//           );
//         }
//       }

//       await sequelize.query(
//         `
//         SELECT db_import_clinicorp.base_migration_clinicorp(
//           :accountId,
//           'db_import_clinicorp',
//           :clairisClient,
//           'general_prontclinic',
//           :idSeq,
//           '235',
//           :migrationId
//         );
//       `,
//         {
//           replacements: {
//             accountId,
//             clairisClient: `clairis_client_${idSeq}`,
//             idSeq,
//             migrationId,
//           },
//         }
//       );

//       return res.status(200).json({ message: 'Migração concluída com sucesso', migrationId });
//     } catch (err: any) {
//       console.error(err);

//       return res.status(500).json({ error: err.message });
//     }
//   }

//   return res.status(405).json({ error: 'Method not allowed' });
// }

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '200mb', // aumentar limite caso arquivos sejam grandes
//     },
//   },
// };

function normalizeDate(value: any): Date | null {
  if (!value) return null

  // Se já for Date
  if (value instanceof Date) return value

  // Se vier em formato string ISO
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    return new Date(value)
  }

  // Se vier como número ou string no formato YYYYMMDD
  if (typeof value === 'number' || /^[0-9]{8}$/.test(value.toString())) {
    const str = value.toString()
    const year = parseInt(str.slice(0, 4), 10)
    const month = parseInt(str.slice(4, 6), 10) - 1 // mês no JS começa do 0
    const day = parseInt(str.slice(6, 8), 10)

    return new Date(year, month, day)
  }

  return null
}

function removeAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeKey(key: string) {
  return key
    .toLowerCase() // minúsculo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '_') // substitui tudo que não é letra/número por _
    .replace(/^_+|_+$/g, '') // remove _ do começo/fim se existir
}

async function createMigration(req: Request, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // body vindo como FormData
    const formData = await req.formData()

    const accountId = formData.get('accountId') as string
    const accountName = formData.get('accountName') as string
    const idSeq = formData.get('idSeq') as string
    const userId = formData.get('userId') as string

    if (!accountId || !accountName || !idSeq) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const migrationId = uuidv4()

    // cria registro de controle
    await MigrationDataControl.create({
      id: migrationId,
      accountId,
      name: accountName,
      status: 'loaded',
      statusDiagnostic: null,
      createdUserId: userId,
      updatedUserId: userId
    })

    // arquivos
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'Nenhum arquivo recebido' }, { status: 400 })
    }

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

      // Normaliza nome do arquivo
      let baseName = file.name.replace(/\.(xlsx|xls)$/i, '')

      baseName = baseName.replace(/ - Cópia/gi, '')
      baseName = baseName.replace(/\(\d+\)/g, '')
      baseName = baseName.trim()

      const tableName = tableMap[baseName]

      if (!tableName) {
        console.warn(`Arquivo ${file.name} ignorado: não mapeado em tableMap`)
        continue
      }

      if (jsonData.length > 0) {
        await sequelize.getQueryInterface().bulkInsert(
          { tableName, schema: 'db_import_clinicorp' },
          jsonData.map((row: any) => {
            const lowerRow: any = {}

            for (const key of Object.keys(row)) {
              const normalizedKey = normalizeKey(key) // normaliza: remove acento, espaços → _
              let value = row[key]

              // Substitui strings vazias por null
              if (value === '') value = null

              // Para campos obrigatórios: se especialidade estiver vazia, coloca valor padrão
              if (normalizedKey === 'especialidade' && !value) {
                value = 'Sem Especialidade'
              }

              // Normaliza valores de string (remove acentos)
              if (typeof value === 'string') {
                value = removeAccents(value)
              }

              lowerRow[normalizedKey] = value
            }

            // Campos de controle
            lowerRow.account_id = accountId
            lowerRow.migration_data_control_id = migrationId

            if ('createatomicdate' in lowerRow) {
              lowerRow.createatomicdate = null
            }

            if ('checkoutdateatomic' in lowerRow) {
              lowerRow.checkoutdateatomic = null
            }

            if ('birthdate' in lowerRow) {
              lowerRow.birthdate = normalizeDate(lowerRow.birthdate)
            }

            if ('canceleddateatomic' in lowerRow) {
              lowerRow.canceleddateatomic = normalizeDate(lowerRow.canceleddateatomic)
            }

            if ('reconcileatomicdate' in lowerRow) {
              lowerRow.reconcileatomicdate = normalizeDate(lowerRow.reconcileatomicdate)
            }

            return lowerRow
          })
        )
      }
    }

    // procedure
    await sequelize.query(
      `
  SELECT db_import_clinicorp.base_migration_clinicorp(
    :accountId,
    'db_import_clinicorp',
    :clairisClient,
    'general_prontclinic',
    :idSeq,
    :generationType,
    :userId,
    :migrationId
  );
`,
      {
        replacements: {
          accountId,
          clairisClient: `clairis_client_${idSeq}`,
          idSeq,
          generationType: '235',
          userId,
          migrationId
        }
      }
    )

    return NextResponse.json({ message: 'Migração concluída com sucesso', migrationId })
  } catch (err: any) {
    console.error('Erro na migração:', err)

    // Captura informações úteis do erro Sequelize/Postgres
    const errorResponse: any = {
      message: err.message || 'Erro desconhecido',
      name: err.name,
      stack: err.stack
    }

    // Se for erro Sequelize, traz detalhes adicionais
    if (err.errors) {
      errorResponse.errors = err.errors.map((e: any) => ({
        message: e.message,
        type: e.type,
        path: e.path,
        value: e.value
      }))
    }

    if (err.parent) {
      errorResponse.parent = {
        message: err.parent.message,
        detail: err.parent.detail,
        code: err.parent.code,
        column: err.parent.column,
        table: err.parent.table,
        schema: err.parent.schema
      }
    }

    return NextResponse.json({ error: errorResponse }, { status: 500 })
  }
}

async function getMigrations() {
  try {
    const migrations = await MigrationDataControl.findAll({
      order: [['createdAt', 'DESC']]
    })

    return NextResponse.json(migrations, { status: 200 })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json({ error: 'Erro ao buscar as migrações', e: error }, { status: 500 })
  }
}

export const GET = authMiddleware(getMigrations)

export const POST = authMiddleware(createMigration)
