/* eslint-disable prettier/prettier */
export class CreateSignerDto {
    clinicId?: string;  
    accountId: string;    
    signerId: string;       
    council?: string;
    numberCouncil?: number;     
    name: string;         
    email: string;         
    cpf: string;         
    date: Date;      
    time: string;
    isProfessional: boolean;      
    hash?: string; 
    imgSignature?: string;
    fontFamily?: string; 
  }