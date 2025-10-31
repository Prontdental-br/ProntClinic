export class CreateContractSignatureDto {
    numberOfSigners: number; 
    date: Date; 
    time: string; 
    status: 'pending' | 'completed' | 'canceled'; 
    signer1Id?: string; 
    signer2Id?: string; 
    documentType: string; 
    hashDoc: string;
    documentId: string;
  }