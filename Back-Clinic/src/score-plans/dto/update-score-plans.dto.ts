/* eslint-disable prettier/prettier */
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateScoreDto {
    @IsOptional()
    @IsNumber()
    @IsPositive()
    readonly numberOfConsultations?: number;

    @IsOptional()
    @IsNumber()
    readonly value?: number;

    @IsOptional()
    @IsNumber()
    readonly valuePerConsultation?: number;
}