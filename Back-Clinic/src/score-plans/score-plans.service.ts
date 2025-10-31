/* eslint-disable prettier/prettier */
import axios from 'axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateScoreDto } from './dto/create-score-plans.dto';
import { UpdateScoreDto } from './dto/update-score-plans.dto';
import { ScorePlans } from './entities/score-plans.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { ConfigService } from '@nestjs/config';
import { ScoreConsultation } from 'src/score-consult/entities/score-consult.entity';
import { Op } from 'sequelize';
import { ScorePlanPayment } from './entities/score-plans-payment.entity';
import AsaasAccount from 'src/accounts/entities/asaasAcount.entity';

@Injectable()
export class ScoreService {
    constructor(
        @InjectModel(ScorePlans)
        private readonly scoreModel: typeof ScorePlans,
        private readonly configService: ConfigService,
    ) {}

    async create(createScoreDto: CreateScoreDto): Promise<ScorePlans> {
   
        return this.scoreModel.create({ ...createScoreDto });
    }

    async findAll(): Promise<ScorePlans[]> {
        return this.scoreModel.findAll();
    }

    async findOne(id: string): Promise<ScorePlans> {
        const score = await this.scoreModel.findByPk(id);
        if (!score) {
            throw new NotFoundException(`ScorePlan with id ${id} not found`);
        }
        return score;
    }

    async update(id: string, updateScoreDto: UpdateScoreDto): Promise<ScorePlans> {
        const score = await this.findOne(id);
        return score.update(updateScoreDto);
    }

    async remove(id: string): Promise<void> {
        const score = await this.findOne(id);
        await score.destroy();
    }

    private async requestCreditAnalysis(document: string): Promise<any> {
        const apiUrl = this.configService.get<string>('API_VIGIDATA');
        const apiToken = this.configService.get<string>('TOKEN_VIGIDATA');
    
        try {
          const response = await axios.post(
            apiUrl,
            { Document: document },
            {
              headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
              },
            },
          );
    
          return response.data;
        } catch (error) {
          throw new Error('Erro ao analisar o crédito.');
        }
    }

    private async checkConsultationPeriod(patientId: string) {
      const fifteenDaysAgo = new Date();
      const fifteenDays = 15;
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - fifteenDays);
    
      // Verificar se já existe uma consulta dentro do período de 15 dias
      const recentConsultation = await ScoreConsultation.findOne({
        where: {
          patientId: patientId,
          createdAt: {
            [Op.gte]: fifteenDaysAgo.toISOString(), 
          },
        },
      });
    
      if (recentConsultation) {
        throw new BadRequestException('Já existe uma consulta de crédito recente para este paciente nos últimos 15 dias.');
      }
    }

    async getScoreConsultation(data: { id: string, document: string, patientId: string, accountId: string }) {

      const sanitizedCPF = data.document.replace(/[.-]/g, '');
    
      await this.checkConsultationPeriod(data.patientId);

      if(data.id) {
        const professional = await Professional.findOne({
          where: { id: data.id, canAccessPlans: true },
        });
        
        if (!professional) {
          throw new NotFoundException('Profissional não encontrado ou sem acesso a consulta de crédito');
        }
      } 
        
      const clinic = await Clinic.findOne({
        where: { accountId: data.accountId },
      });

      if (!clinic) {
        throw new NotFoundException('Clinica não encontrada');
      }

      if (clinic.scoreCredit <= 0) {
        throw new BadRequestException('Não possui créditos para consulta');
      }

      const creditAnalysis = await this.requestCreditAnalysis(sanitizedCPF);

      // Salvar dados na tabela ScoreConsultation
        await ScoreConsultation.create({
          patientId: data.patientId, 
          accountId: clinic.accountId,
          documentFormatted: creditAnalysis.response.DocumentFormatted,
          creditScoreD00: creditAnalysis.response['CreditScore D00'],
          creditScoreD30: creditAnalysis.response['CreditScore D30'],
          creditScoreD60: creditAnalysis.response['CreditScore D60'],
          incomePersonal: creditAnalysis.response['Income Personal'],
          incomePartner: creditAnalysis.response['Income Partner'],
          incomeFamily: creditAnalysis.response['Income Family'],
          incomePersonalClass: creditAnalysis.response['Income PersonalClass'],
          incomeFamilyClass: creditAnalysis.response['Income FamilyClass'],
          formattedNumber: creditAnalysis.response['FormattedNumber'],
          email: creditAnalysis.response['Email'],
          address: creditAnalysis.response['Address'],
        });
  
      clinic.scoreCredit -= 1;
      await clinic.save();
  
      return creditAnalysis;
    }  

    private async getCustomerId(accountEmail: string, docNumber: string): Promise<string> {
      const url = `${this.configService.get<string>('ASAAS_SANDBOX_URL')}/customers?email=${encodeURIComponent(accountEmail)}&cpfCnpj=${docNumber}`;
      const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          access_token: apiKey,
        },
      };

      const responseCostumer = await axios.get(url, options);
      const customerId = responseCostumer.data.data[0].id;
  
      if (responseCostumer.data.data.length === 0) {
        throw new NotFoundException('Cliente não encontrado');
      }
      console.log(customerId);
      return customerId;
    }
    
    private getExpirationDate(daysToAdd: number): string {
      const date = new Date();
      date.setDate(date.getDate() + daysToAdd);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    private async createAsaasPayment(customerId: string, plan: any, formattedDate: string) {
      const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
      const options = {
        method: 'POST',
        url: `${this.configService.get('ASAAS_SANDBOX_URL')}/payments`,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: apiKey,
        },
        data: {
          billingType: 'BOLETO',
          customer: customerId,
          value: plan.value,
          dueDate: formattedDate,
          externalReference: JSON.stringify({ type: 'score' }),
          description: `Pagamento de consulta score. Com o plano de ${plan.numberOfConsultations} consultas`,
        },   
      };
      const response = await axios.request(options);
      if (response.status !== 200) {
        throw new BadRequestException('Erro ao criar pagamento no Asaas');
      }
      return response.data;
    }

    async createPayment(data: { accountId: string; planId: string }) {
      const { accountId, planId } = data;
  
      const plan = await ScorePlans.findOne({ where: { id: planId } });
      if (!plan) {
        throw new NotFoundException('Plano não encontrado');
      }
  
      const account = await AsaasAccount.findOne({ where: { account_id: accountId } });
      if (!account) {
        throw new NotFoundException('Conta não encontrada');
      }
  
      const clinic = await Clinic.findOne({ where: { account_id: accountId } });
      if (!clinic) {
        throw new NotFoundException('Clínica não encontrada');
      }

        const customerId = await this.getCustomerId(account.email, clinic.docNumber);
        const formattedDate = this.getExpirationDate(2); // Add two days
        const paymentData = await this.createAsaasPayment(customerId, plan, formattedDate);
  
        await ScorePlanPayment.create({
          accountId: accountId,
          paymentId: paymentData.id,
          custumerId: customerId,
          value: plan.value,
          generationDate: new Date(),
          expirationDate: new Date(formattedDate),
          paymentDate: null,
          numberOfConsultations: plan.numberOfConsultations,
          status: paymentData.status,
        });
  
        return paymentData.invoiceUrl;
    } 
}
