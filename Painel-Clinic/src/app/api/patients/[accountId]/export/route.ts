import { NextResponse } from 'next/server'

import type { NextApiRequest } from 'next'

import authMiddleware from '@/app/api/middleware/authMiddleware';
import patientRepository from '@/app/api/repositories/patient.repository';
import { jsonToFile } from '@/utils/excel';

const parseGender = (gender: string) => {
  switch (gender) {
    case 'M':
      return 'Masculino';
    case 'F':
      return 'Feminino';
    default:
      return 'Outros';
  }
}

const parseBirthdayDate = (dateString: string) => {
  if (dateString === '') {
    return '';
  }

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

async function getRoute(req: NextApiRequest) {
  try {
    const { pathname } = new URL(req.url || '')
    const split = pathname.split('/');
    const accountId = (split.at(split.length - 2)) || '';
    const patients = await patientRepository.retrieveAllByAccountId(accountId);

    const data = patients.map((element) => {
      return { 'Nome do Paciente': element.name, 'Gênero do Paciente': parseGender(element.gender), 'Data de Nascimento do Paciente': parseBirthdayDate(element.birthDate), 'CPF do Paciente': element.cpf, 'RG do Paciente': element.rg, 'Telefone do Paciente': element.cellPhone, 'Email do Paciente': element.email, 'Nome do Responsável': element.responsibleName, 'Data de Nascimento do Responsável': element.responsibleBirthDate, 'CPF do Responsável': element.responsibleCpf, 'Celular do Responsável': element.responsibleCellPhone, 'Observação': element.observation, 'CEP': element.zipCode, 'Rua': element.street, 'Bairro': element.neighborhood, 'Cidade': element.city, 'Estado': element.state }
    });

    const buffer = jsonToFile(data);

    const response = new NextResponse(buffer, { status: 200 })

    response.headers.set('Content-Type', 'application/vnd.ms-excel');
    response.headers.set('Content-Disposition', 'attachment; filename="data.xlsx"')

    return response;
  } catch (e) {
    return NextResponse.json(e)
  }
}


export const GET = authMiddleware(getRoute);
