/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ScoreConsultation } from './entities/score-consult.entity';
import { CreateScoreConsultationDto } from './dto/create-score-consult.dto';
import { UpdateScoreConsultationDto } from './dto/update-score-consult.dto';
import { Op } from 'sequelize';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { Patient } from 'src/patients/entities/patient.entity';

@Injectable({ scope: Scope.REQUEST })
export class ScoreConsultationService {
  constructor(
    private tenantModelService: TenantModelService
  ) {}

  @TenantModel(ScoreConsultation)
  private readonly scoreConsultationModel: typeof ScoreConsultation

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient

  async create(createScoreConsultationDto: CreateScoreConsultationDto): Promise<ScoreConsultation> {
    return this.scoreConsultationModel.create({ ...createScoreConsultationDto });
  }


  async findAll(patientId: string): Promise<ScoreConsultation[]> {
    const fifteenDaysAgo = new Date();
    const fifteenDays = 15;

    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - fifteenDays);
    
    await this.scoreConsultationModel.destroy({
      where: {
        patientId: patientId,
        createdAt: {
          [Op.lte]: fifteenDaysAgo.toISOString(), 
        },
      },
      force: true, 
    });

    const patient = await this.patientModel.findOne({
      where: {
        id: patientId
      }
    })
  
    const recentConsultations = await this.scoreConsultationModel.findOne({
      where: {
        patientId: patientId,
        createdAt: {
          [Op.gte]: fifteenDaysAgo, 
        },
      },
    });

    if(recentConsultations) {
      const result = {
        ...recentConsultations.toJSON(),  // Converte a consulta para um objeto
        patientName: patient.name   // Adiciona o nome do paciente
      };
    
      return [ result ];
    }

    return [];
  }
  

  async findOne(patientId: string): Promise<ScoreConsultation> {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    await this.scoreConsultationModel.destroy({
      where: {
        patientId: patientId,
        createdAt: {
          [Op.lte]: fifteenDaysAgo.toISOString(), 
        },
      },
      force: true, 
    });
  
    const recentConsultations = await this.scoreConsultationModel.findOne({
      where: {
        patientId: patientId,
        createdAt: {
          [Op.gte]: fifteenDaysAgo.toISOString(), 
        },
      },
    });
  
    return recentConsultations;
  }

  async update(
    id: string,
    updateScoreConsultationDto: UpdateScoreConsultationDto,
  ): Promise<ScoreConsultation> {
    const consultation = await this.findOne(id);
    return consultation.update({ ...updateScoreConsultationDto });
  }


  async remove(id: string): Promise<void> {
    const consultation = await this.findOne(id);
    await consultation.destroy();
  }
}
