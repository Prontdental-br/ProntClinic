import { StringSchema } from "yup"

export type AccountDataType = {

  //balancer: number
  // hourly: string  
  id: string
  name: string
  description: string
  active: boolean
  consultationTime: number
  cellPhone: string
  type: string
  planType: string;
  doc:string
  docType: 'cpf' | 'cnpj'
  communicationName: string
  clinicsResponsible: string
  timezone: string
  openingTime: string
  closingTime: string
  cep: string
  street: string
  addressNumber: string
  addressComplement: string
  neighborhood: string
  city: string
  state: string  
}
