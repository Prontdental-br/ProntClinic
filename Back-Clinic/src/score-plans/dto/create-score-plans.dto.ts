/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateScoreDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    readonly numberOfConsultations: number;

    @IsNotEmpty()
    @IsNumber()
    readonly value: number;

    @IsNotEmpty()
    @IsNumber()
    readonly valuePerConsultation: number;
}