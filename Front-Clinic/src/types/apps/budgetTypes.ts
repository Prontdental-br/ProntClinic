import { ClinicType } from './clinicsTypes'

export type TreatmentType = {
  id: string
  name: string
  description: string
  value: number
  specialtyId: string
  active: boolean
}

export type PatientType = {
  id: string
  name: string
  cellPhone: string
  cpf: string
  rg: string
  planType: string
  email: string
  responsibleName: string
  responsibleBirthDate: string
  responsibleRg: string
  responsibleCpf: string
  responsibleCellPhone: string
  observation: string
  zipCode: string
  street: string
  neighborhood: string
  insuranceNumber?: number
  insuranceName?: string
  city: string
  state: string
  avatar: string
  gender: string
}

export type PlanType = {
  id: string
  name: string
}

export type ProfessionalType = {
  id: string
  name: string
}

export enum BudgetItemStatus {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED'
}

export type BudgetItemType = {
  professional?: ProfessionalType
  selected?: boolean
  treatment?: TreatmentType
  status?: BudgetItemStatus
  statusTreatment?: string
  observation?: string
  description: string
  faces?: Array<string>
  value: number
  qtd?: number
  session?: number
  unit?: string
}

export enum BudgetStatusEnum {
  OPEN = 'O',
  APPROVED = 'A',
  REJECTED = 'R',
  CANCELED = 'C'
}

export type BudgetType = {
  id: string
  patientId: string
  patient: PatientType
  clinic: ClinicType
  transactions?: any
  imgSignature: string
  name: string
  email: string
  planId: string
  plan: PlanType | null
  fontFamily: string
  professionalId: string
  professional: ProfessionalType
  description: string
  observation: string
  status: BudgetStatusEnum
  budgetTreatments: BudgetItemType[]
  installments: number
  installmentsMethods?: string[]
  downPaymentMethods?: string[]
  downPaymentInstallments: number
  downPayment: number
  subtotal: number
  isSigned?: boolean
  hash?: string
  total: number
  discount: number
  date: string
  budgetPaid?: boolean
  shapesTabRegiao: Shape[]
  shapesTabAi: Shape[]
  imageCaptured: string
  showUnits?: boolean
  hideOdontogram?: boolean
}

export enum graphType {
  DECIDUOS = 'DECIDUOS',
  PERMANENTES = 'PERMANENTES',
  ESTETICA = 'ESTETICA'
}

export type Shape = {
  type: string
  sX: number
  sY: number
  fX?: number
  fY?: number
  units?: string
  product?: string
  color?: string
}
