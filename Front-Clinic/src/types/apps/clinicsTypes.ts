export type ClinicType = {
    accountId?: string;
    id:string;
    name: string;    
    profilePic: string;
    docType: DocTypeType;
    docNumber: string;
    communicationName: string;
    responsibleName: string;
    openHour: string;
    closeHour: string;
    emmitReceiptBy: EmmitReceiptByType;
    timezone: string;
    cep: string;
    street: string;
    addressNumber: string;
    addressComplement: string;
    neighborhood: string;
    city: string;
    state: string;
    birthday?: string;
    calendarSchedule?: string
    whatsappNumber?: string;
    whatsappApiUrl?: string;
    whatsappApiToken?: string;
}

export type EmmitReceiptByType = 'clinic' | 'professional' | 'dentist' | null;

export type DocTypeType = 'cpf' | 'cnpj';

export type PlanType = {
    id: string;
    name: string;
    specialty: string;
}

export interface CashType {
    id: string
    name: string
    description: string
    default: boolean
    active: boolean
}

export interface MedicineType {
  id: string
  title?: string
  description?: string
  description1?: string
  type?: string
  active?: boolean
}

export type SpecialtyType = {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

export enum treatmentComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGHT = 'hight',
}

export type TreatmentType = {
    id: string;
    name: string;
    description: string;
    specialtyId: string;
    value: number;
    active: boolean;
    cost: number;
    contraindications: string;
    complexity: string;
}