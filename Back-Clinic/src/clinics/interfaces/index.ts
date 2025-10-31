export interface CreateAsaasCustomer {
  document: string;
  name: string;
  email: string;
  id: string;
}

export interface AsaasCustomer {
  id: string;
  dateCreated: string;
  name: string;
  email: string;
  cpfCnpj: string;
  personType: string;
  externalReference: string;
}
