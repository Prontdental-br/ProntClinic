// ** Types
import { ThemeColor } from 'src/@core/layouts/types'

export type UsersType = {
  id: number
  role: string
  email: string
  status: string
  avatar: string
  company: string
  country: string
  contact: string
  fullName: string
  username: string
  currentPlan: string
  avatarColor?: ThemeColor
}

export type ProjectListDataType = {
  id: number
  img: string
  hours: string
  totalTask: string
  projectType: string
  projectTitle: string
  progressValue: number
  progressColor: ThemeColor
}

export enum PlanType {
  'P' = 'Privado',
  'C' = 'Convênio',
  'O' = 'Outros'
}

export type PatientDataType = {
  id: number
  avatar: string
  name: string
  birthDate: string
  gender: string
  cellPhone: string
  planType: string
  role: string
  email: string
  status: string
  cpf: string
  insuranceNumber: number;
  insuranceName: string;
  avatarColor?: ThemeColor
  currentConsultationForecast?: string;
  performedInThisConsultation?: string;
  nextConsultationForecast?: string;
}

export type PatientTreatmentsDataType = {
  id: number
  treatmentsDescription: string
  doctor: string
  planType: string
  status: string
}

export type PatientBudgetTreatmentsDataType = {
  id: number
  description: string
  doctor: string
  planType: string
  status: string
  date: string
  patientId: string
  plan: {
    name: string
  }
  planId: string
  professional: {
    name: string
  }
  professionalId: string
}

export type PacientBudgetDataType = {
  id: number
  date: string
  description: string
  total: number
  status: string
  plan: any
}

export type PacientBudgetFlashDataType = {
  id: number
  name: string
  fone: string
  date: string
  description: string
  total: number
  status: string
}

export enum TypeEnum {
  revenue = 'R',
  expense = 'E',
}

export type PacientDebitDataType = {
  id: string
  date: string
  description: string
  total: number
  subtotal?: number
  status: string
  patient?: string
  paymentDate?: Date
  paymentType?: string
  dueDate?: Date
  discount?: number
  type: TypeEnum
}

export type PacientAnmneseDataType = {}

export type PacientDocumentsType = {}

export type ProfessionalDataType = {
  id: string
  name: string
  specialty: string
  phone: string
  gender: string
  email: string
  cro: string
  cpf: string
  typeCr?: string
  isAdmin?: boolean
  isPrivate?: boolean
  type?: string
  password?: string
  canAccessPlans?: boolean
  signaturePic: string | null
  confirmPassword?: string
  commissionWhen?: string
  commissionType?: string
  commissionValue?: number
}

export type PlanDataType = {
  id: number
  name: string
  specialty: string
}
