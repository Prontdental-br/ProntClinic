type Professional = {
  id: string
  name: string
}

type Patient = {
  id: string;
  name: string;
  cellPhone: string;
  email: string;
}

export type EvolutionCreateDataType = {
  professionalId: string
  patientId: string
  dateEvolution: string
  description: string
}

export type EvolutionDataType = {
  id: string
  professionalId: string
  professionalName: string
  patientId: string
  patientName: string
  date: string
  description: string
}

export type EvolutionResponseDataType = {
  id: string
  patientId: string
  professionalId: string
  dateEvolution: string
  professional: Professional
  isSigned: boolean;
  patient: Patient
  description: string
}
