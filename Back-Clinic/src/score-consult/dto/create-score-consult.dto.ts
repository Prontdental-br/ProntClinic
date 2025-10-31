/* eslint-disable prettier/prettier */
export class CreateScoreConsultationDto {
    patientId: number;
    documentFormatted: string;
    creditScoreD00?: number;
    creditScoreD30?: number;
    creditScoreD60?: number;
    incomePersonal?: number;
    incomePartner?: number;
    incomePersonalClass?: number;
    incomeFamilyClass: number;
    incomeFamily?: number;
    formattedNumber?: string;
    email?: string;
    address?: string;
}