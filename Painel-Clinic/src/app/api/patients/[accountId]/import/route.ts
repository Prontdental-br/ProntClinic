import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import authMiddleware from '@/app/api/middleware/authMiddleware'
import patientRepository from '@/app/api/repositories/patient.repository'
import { excelDateToJSDate, readExcelData } from '@/common/excel'
import { formatCellphone, formatCPF, formatRG } from '@/common/formatters'
import { GenderEnum } from '@/app/api/db/models/Patient'

interface PatientsExcel {
  'Nome do Paciente': string
  'Gênero do Paciente': string
  'Data de Nascimento do Paciente': number
  'CPF do Paciente': string
  'RG do Paciente': string
  'Telefone do Paciente': string
  'Email do Paciente': string
  'Nome do Responsável': string
  'Data de Nascimento do Responsável': number
  'CPF do Responsável': string
  'Celular do Responsável': string
  Observação: string
  CEP: string
  Rua: string
  Bairro: string
  Cidade: string
  Estado: string
}

const parseGender = (gender: string) => {
  switch (gender.toLowerCase()) {
    case 'm':
      return GenderEnum.Male
    case 'masculino':
      return GenderEnum.Male
    case 'f':
      return GenderEnum.Female
    case 'feminino':
      return GenderEnum.Female
    case 'undefined':
      return ''
    default:
      return 'Outros'
  }
}

async function postRoute(req: NextRequest) {
  try {
    const formData = await req.formData()

    const { pathname } = new URL(req.url || '')
    const split = pathname.split('/')
    const accountId = split.at(split.length - 2) || ''
    const file = formData.get('file') as unknown as File | null

    if (!file) {
      return NextResponse.json(null, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const patientsData = readExcelData<PatientsExcel>(buffer)

    const a = patientsData.map(element => {
      return {
        accountId: accountId,
        email: element['Email do Paciente'] ?? '',
        responsibleRg: '',
        avatar: null,
        birthDate: element['Data de Nascimento do Paciente']
          ? excelDateToJSDate(element['Data de Nascimento do Paciente']).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
          : '',
        cellPhone: element['Telefone do Paciente'] ? formatCellphone(`${element['Telefone do Paciente']}`) : '',
        city: element['Cidade'] ?? '',
        cpf: element['CPF do Paciente'] ? formatCPF(`${element['CPF do Paciente']}`) : '',
        planType: '',
        gender: parseGender(`${element['Gênero do Paciente']}`),
        name: element['Nome do Paciente'] ?? '',
        neighborhood: element['Bairro'] ?? '',
        observation: element['Observação'] ?? '',
        responsibleBirthDate: element['Data de Nascimento do Responsável']
          ? excelDateToJSDate(element['Data de Nascimento do Responsável']).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
          : '',
        responsibleCellPhone: element['Celular do Responsável']
          ? formatCellphone(`${element['Celular do Responsável']}`)
          : '',
        responsibleCpf: element['CPF do Responsável'] ? formatCPF(`${element['CPF do Responsável']}`) : '',
        responsibleName: element['Nome do Responsável'] ?? '',
        rg: element['RG do Paciente'] ? formatRG(`${element['RG do Paciente']}`) : '',
        state: element['Estado'] ?? '',
        street: element['Rua'] ?? '',
        zipCode: element['CEP'] ?? ''
      }
    })

    await patientRepository.bulkCreatePatients(a, accountId)

    const response = new NextResponse(null, { status: 204 })

    return response
  } catch (e) {
    return NextResponse.json(e)
  }
}

export const POST = authMiddleware(postRoute)
