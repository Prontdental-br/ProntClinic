/* eslint-disable prettier/prettier */
import { Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { Clinic } from './entities/clinic.entity';
import { Treatment } from 'src/treatments/entities/treatment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { Sequelize } from 'sequelize-typescript';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import {
  specialties as defaultSpecialties,
  SrcTreatment,
} from 'src/treatments/sources/specialties';
import { AccountsService } from 'src/accounts/accounts.service';
import { UpdateAccountDto } from 'src/accounts/dto/update-account.dto';
import { TenantModelService } from 'src/tenant/tenant/tenant.serviceModel';
import { TenantModel } from 'src/common/decorators/tenant.decorators';
import { OpportunityColumn } from 'src/opportunity/entities/opportunity-columns.entity';
import { ProsthesisColumn } from 'src/prothesis/entities/prosthesis-columns.entity';
import { AsaasSubscriptionService } from 'src/asaas-subscription/asaas-subscription.service';
import { User } from 'src/users/entities/user.entity';
import { AnamneseConfig } from 'src/anamnese/entities/anamnese-config.entity';
import { AnamneseConfigItem } from 'src/anamnese/entities/anamnese-config-item.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { PromotionalCodeService } from 'src/promotional-code/promotional-code.service';
@Injectable({ scope: Scope.REQUEST })
export class ClinicsService {
  constructor(
    @InjectModel(Treatment)
    private sequelize: Sequelize,
    private tenantService: TenantService,
    private accountsService: AccountsService,
    private asaasSubscriptionService: AsaasSubscriptionService,
    private readonly tenantModelService: TenantModelService,
    private readonly promotionalCodeService: PromotionalCodeService,
  ) {}

  @TenantModel(Clinic)
  private readonly clinicModel: typeof Clinic;

  @TenantModel(Specialty)
  private readonly specialtyModel: typeof Specialty;

  @TenantModel(Treatment)
  private readonly treatmentModel: typeof Treatment;

  @TenantModel(OpportunityColumn)
  private readonly opportunityColumnModel: typeof OpportunityColumn;

  @TenantModel(ProsthesisColumn)
  private readonly prosthesisColumnModel: typeof OpportunityColumn;

  @TenantModel(AnamneseConfig)
  private readonly anamneseConfigModel: typeof AnamneseConfig;

  @TenantModel(AnamneseConfigItem)
  private readonly anamneseConfigItemModel: typeof AnamneseConfigItem;

  @TenantModel(Patient)
  private readonly patientModel: typeof Patient;

  private getDateInSevenDays() {
    const today = new Date();
    // const fiveDaysLater = new Date(today.setDate(today.getDate() + 7));
    const fiveDaysLater = today;

    const year = fiveDaysLater.getFullYear();
    const month = String(fiveDaysLater.getMonth() + 1).padStart(2, '0');
    const day = String(fiveDaysLater.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // private async createAsaasSubscription(userData: CreateAsaasCustomer) {
  //   try {
  //     const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
  //     const config = {
  //       headers: {
  //         access_token: apiKey,
  //       },
  //     };
  //     const { data }: { data: AsaasCustomer } = await axios.post(
  //       `${process.env.ASAAS_SANDBOX_URL}/customers`,
  //       {
  //         externalReference: userData['id'],
  //         name: userData['name'],
  //         cpfCnpj: userData['document'].replace(/\D/g, ''),
  //         email: userData['email'],
  //       },
  //       config,
  //     );
  //     const res = await axios.post(
  //       `${process.env.ASAAS_SANDBOX_URL}/subscriptions`,
  //       {
  //         customer: data.id,
  //         billingType: 'UNDEFINED',
  //         cycle: 'MONTHLY',
  //         value: 119.9,
  //         nextDueDate: this.getDateInSevenDays(),
  //       },
  //       config,
  //     );
  //   } catch (error) {
  //     console.error(error.response.data);
  //     console.log('erro');
  //   }
  // }

  async create(createClinicDto: CreateClinicDto) {
    try {
      const accountId = this.tenantService.tenant.id;

      const existingClinic = await this.clinicModel.findOne({
        where: { accountId },
      });

      if (existingClinic) {
        return existingClinic;
      }

      createClinicDto.emmitReceiptBy =
        createClinicDto.docType === 'cpf' ? 'professional' : 'clinic';

      const user = await User.findOne({ where: { accountId } });

      const accountData = await this.accountsService.findOne(accountId);

      let coupon = null;
      if (accountData?.couponId) {
        coupon = await this.promotionalCodeService.findById(
          accountData.couponId,
        );
      }

      const customer = await this.asaasSubscriptionService.createAsaasCustomer({
        id: accountId,
        document: createClinicDto.docNumber,
        email: user?.email,
        name: createClinicDto.name,
      });

      const clinic = await this.clinicModel.create({
        ...createClinicDto,
        accountId,
      });

      await this.asaasSubscriptionService.startMonthlyPlanAfterInitialPayment(
        customer,
        'P',
        coupon
          ? {
              id: coupon.id,
              name: coupon.name,
              discountPercent: coupon.percentage,
            }
          : undefined,
      );

      await this.ensureInitialData(accountId);

      const upd = new UpdateAccountDto();
      upd.expiresIn = 7;
      upd.expiredSubscription = false;
      upd.active = true;

      await this.accountsService.update(this.tenantService.tenant.id, upd);

      return clinic;
    } catch (err) {
      console.error('Erro ao criar clínica:', err);
      throw err;
    }
  }

  // async hasFirstCharge(accountId: string): Promise<boolean> {
  //   const charges = await this.asaasApi.getPayments(accountId);
  //   return charges.some(charge => {
  //     try {
  //       const ref = JSON.parse(charge.externalReference);
  //       return ref?.type === 'first_charge';
  //     } catch {
  //       return false;
  //     }
  //   });
  // }

  private async ensureInitialData(accountId: string) {
    const [specialtyCount, oppCount, prosCount] = await Promise.all([
      this.specialtyModel.count({ where: { accountId } }),
      this.opportunityColumnModel.count({ where: { accountId } }),
      this.prosthesisColumnModel.count({ where: { accountId } }),
    ]);

    if (specialtyCount === 0) await this.loadDefaultTreatments();
    if (oppCount === 0) await this.loadDefaultColumns();
    if (prosCount === 0) await this.loadDefaultColumnsProsthesis();

    const existingPatient = await this.patientModel.findOne({
      where: { accountId: accountId, name: 'Compromisso' },
    });

    if (!existingPatient) {
      await this.patientModel.create({
        accountId: accountId,
        name: 'Compromisso',
        cellPhone: '11111111111',
        active: 1,
      });
    }

    await this.ensureAnamnesesExist(accountId);
  }

  private async ensureAnamnesesExist(accountId: string) {
    const anamneseTitles = [
      'Anamnese Padrão',
      'Anamnese Cirurgia e Implante',
      'Anamnese Infantil',
      'Anamnese Ortodôntica',
      'Anamnese Estética',
      'Protocolo HOF',
    ];

    const existingAnamneses = await this.anamneseConfigModel.findAll({
      where: {
        accountId,
        desc: anamneseTitles,
      },
    });

    const existingTitles = new Set(existingAnamneses.map((a) => a.desc));

    if (!existingTitles.has('Anamnese Padrão')) {
      await this.createDefaultAnamneseConfig();
    }
    if (!existingTitles.has('Anamnese Cirurgia e Implante')) {
      await this.createAnamneseCirurgiaImplante();
    }
    if (!existingTitles.has('Anamnese Infantil')) {
      await this.createAnamneseInfantil();
    }
    if (!existingTitles.has('Anamnese Ortodôntica')) {
      await this.createAnamneseOrtodontica();
    }
    if (!existingTitles.has('Anamnese Estética')) {
      await this.createAnamneseEstetica();
    }

    if (!existingTitles.has('Protocolo HOF')) {
      await this.createAnamneseHOF();
    }
  }

  async update(id: string, updateClinicDto: UpdateClinicDto) {
    const updated = await this.clinicModel.update(
      {
        ...updateClinicDto,
      },
      {
        where: {
          id: id,
          accountId: this.tenantService.tenant.id,
        },
      },
    );

    if (!updated) {
      throw new Error('Clinic not found');
    }

    const fixedColumns = await this.opportunityColumnModel.count({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });

    if (fixedColumns === 0) {
      await this.loadDefaultColumns();
    }

    const fixedColumnsProsthesis = await this.prosthesisColumnModel.count({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });

    if (fixedColumnsProsthesis === 0) {
      await this.loadDefaultColumnsProsthesis();
    }

    return this.findOne(id);
  }

  findOne(id: string) {
    return this.clinicModel.findOne({
      where: {
        id: id,
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  findAll() {
    return this.clinicModel.findOne({
      where: {
        accountId: this.tenantService.tenant.id,
      },
    });
  }

  private async loadDefaultTreatments() {
    for (const element of defaultSpecialties) {
      const specialty = await this.specialtyModel.create({
        name: element.specialty.name,
        accountId: this.tenantService.tenant.id,
      });

      const treatments = element.treatments.map((treatment: SrcTreatment) => ({
        name: treatment.name,
        value: treatment.value,
        cost: 0.0,
        specialtyId: specialty.id,
        accountId: this.tenantService.tenant.id,
      }));

      await this.treatmentModel.bulkCreate(treatments);
    }
  }

  private async loadDefaultColumns() {
    const columns = [
      {
        title: 'Aguardando atuação',
        order: 0,
        editable: true,
        color: '#F87171',
        default: true,
      },
      {
        title: 'Contato Inicial',
        order: 1,
        editable: true,
        color: '#60A5FA',
        default: true,
      },
      {
        title: 'Motivos do Contato',
        order: 2,
        editable: true,
        color: '#34D399',
        default: true,
      },
      {
        title: 'Tratativa',
        order: 3,
        editable: true,
        color: '#FBBF24',
        default: true,
      },
    ];

    await this.opportunityColumnModel.bulkCreate(
      columns.map((column) => ({
        ...column,
        accountId: this.tenantService.tenant.id,
      })),
    );
  }

  private async loadDefaultColumnsProsthesis() {
    const columnsProsthesis = [
      {
        title: 'Pré-Laboratório',
        order: 0,
        editable: true,
        color: '#087a64',
        default: true,
      },
      {
        title: 'Envio',
        order: 1,
        editable: true,
        color: '#087a64',
        default: true,
      },
      {
        title: 'Laboratório',
        order: 2,
        editable: true,
        color: '#087a64',
        default: true,
      },
      {
        title: 'Agenda',
        order: 3,
        editable: true,
        color: '#087a64',
        default: true,
      },
      {
        title: 'Realizado',
        order: 4,
        editable: true,
        color: '#087a64',
        default: true,
      },
    ];

    await this.prosthesisColumnModel.bulkCreate(
      columnsProsthesis.map((column) => ({
        ...column,
        accountId: this.tenantService.tenant.id,
      })),
    );
  }

  private async createDefaultAnamneseConfig() {
    const questions = [
      'Tem pressão alta?',
      'Possui alguma alergia? (Como penicilinas, AAS ou outra)',
      'Possui alguma alteração sanguínea?',
      'Já teve hemorragia diagnosticada?',
      'Possui alguma alteração cardiovascular?',
      'Possui diabetes?',
      'Possui asma?',
      'Possui anemia?',
      'Possui alguma disfunção hepática?',
      'Apresenta alguma disfunção renal?',
      'Possui alguma disfunção respiratória?',
      'Possui alguma alteração óssea?',
      'Possui alguma doença transmissível?',
      'Possui alguma outra doença/síndrome não mencionada',
      'Já sofreu alguma reação alérgica ao receber anestesia',
      'Possui azia, má digestão, refluxo, úlcera ou gastrite',
      'Tem dificuldade de abrir a boca',
      'Possui algum antecedente de febre reumática',
      'Escuta algum estalado ao abrir a boca',
      'Está grávida',
      'Está amamentando',
      'Toma anticoncepcional?',
    ];

    const defaultOptions = JSON.stringify([
      { value: 'Sim', Option: 'Sim' },
      { value: 'Não', Option: 'Não' },
      { value: 'Não sei', Option: 'Não sei' },
    ]);

    const config = await this.anamneseConfigModel.create({
      accountId: this.tenantService.tenant.id,
      desc: 'Anamnese Geral',
      active: true,
      templateId: null,
      userCreated: null,
    });

    const items = questions.map((question, index) => ({
      accountId: this.tenantService.tenant.id,
      anamneseConfigId: config.id,
      seq: index + 1,
      question,
      options: defaultOptions,
      questionType: 'YES_NO',
      required: false,
      alert: false,
      userCreated: null,
    }));

    await this.anamneseConfigItemModel.bulkCreate(items);

    return config;
  }

  private async createAnamneseCirurgiaImplante() {
    const questions = [
      { question: 'Está em tratamento médico', type: 'YES_NO' },
      { question: 'Está usando medicação', type: 'YES_NO' },
      {
        question: 'Possui alguma alergia? (Como penicilinas, AAS ou outra)',
        type: 'YES_NO',
      },
      { question: 'Já esteve internado', type: 'YES_NO' },
      { question: 'Já teve hemorragia diagnosticada', type: 'YES_NO' },
      { question: 'Possui alguma alteração sanguínea', type: 'YES_NO' },
      { question: 'Possui alguma alteração cardiovascular', type: 'YES_NO' },
      { question: 'Tem pressão alta', type: 'YES_NO' },
      { question: 'Possui diabetes', type: 'YES_NO' },
      { question: 'Possui asma', type: 'YES_NO' },
      { question: 'Possui anemia', type: 'YES_NO' },
      { question: 'Possui alguma disfunção hepática', type: 'YES_NO' },
      { question: 'Apresenta alguma disfunção renal', type: 'YES_NO' },
      { question: 'Possui alguma disfunção respiratória', type: 'YES_NO' },
      { question: 'Possui alguma alteração óssea', type: 'YES_NO' },
      { question: 'Possui alguma doença transmissível', type: 'YES_NO' },
      {
        question: 'Possui alguma outra doença/síndrome não mencionada',
        type: 'YES_NO',
      },
      {
        question: 'Já sofreu alguma reação alérgica ao receber anestesia',
        type: 'YES_NO',
      },
      {
        question: 'Possui azia, má digestão, refluxo, úlcera ou gastrite',
        type: 'YES_NO',
      },
      { question: 'Está ou esteve em tratamento psicológico', type: 'YES_NO' },
      { question: 'Tem dificuldade de abrir a boca', type: 'YES_NO' },
      {
        question: 'Possui algum antecedente de febre reumática',
        type: 'YES_NO',
      },
      {
        question:
          'Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)',
        type: 'YES_NO',
      },
      {
        question: 'Já se submeteu à Ortodontia (aparelhos e correção)',
        type: 'YES_NO',
      },
      {
        question: 'Já se submeteu à Periodontia (tratamento gengival)',
        type: 'YES_NO',
      },
      {
        question: 'Já se submeteu à Endodontia (tratamento de canal)',
        type: 'YES_NO',
      },
      { question: 'Toma anticoncepcional', type: 'YES_NO' },
      { question: 'Qual a pressão arterial do paciente', type: 'TEXT' },
      {
        question: 'Qual frequência respiratória por minuto do paciente',
        type: 'TEXT',
      },
      {
        question: 'Qual a frequência cardíaca por minuto(bpm) do paciente',
        type: 'TEXT',
      },
      {
        question: 'Possui o hábito de tabagismo, alcoolismo ou uso de drogas?',
        type: 'YES_NO',
      },
    ];

    const defaultOptions = JSON.stringify([
      { value: 'Sim', Option: 'Sim' },
      { value: 'Não', Option: 'Não' },
      { value: 'Não sei', Option: 'Não sei' },
    ]);

    const config = await this.anamneseConfigModel.create({
      accountId: this.tenantService.tenant.id,
      desc: 'Anamnese Cirurgia e Implante',
      active: true,
      templateId: null,
      userCreated: null,
    });

    const items = questions.map((q, index) => ({
      accountId: this.tenantService.tenant.id,
      anamneseConfigId: config.id,
      seq: index + 1,
      question: q.question,
      options: q.type === 'YES_NO' ? defaultOptions : JSON.stringify([]),
      questionType: q.type,
      required: false,
      alert: false,
      userCreated: null,
    }));

    await this.anamneseConfigItemModel.bulkCreate(items);

    return config;
  }

  private async createAnamneseInfantil() {
    const questions = [
      'Está em tratamento médico',
      'Possui alguma alergia? (Como penicilinas, AAS ou outra)',
      'Sente alguma dor nos dentes ou na boca',
      'Está usando medicação',
      'Já esteve internado',
      'Já teve hemorragia diagnosticada',
      'Possui alguma alteração sanguínea',
      'Possui diabetes',
      'Possui asma',
      'Possui anemia',
      'Possui alguma disfunção hepática',
      'Apresenta alguma disfunção renal',
      'Possui alguma disfunção respiratória',
      'Possui alguma alteração óssea',
      'Possui alguma doença transmissível',
      'Está ou esteve em tratamento psicológico',
      'Possui algum antecedente de febre reumática',
      'Possui algum antecedente de endocardite bacteriana',
      'Possui alguma outra doença/síndrome não mencionada',
      'Já sofreu alguma reação alérgica ao receber anestesia',
      'Tem dificuldade de abrir a boca',
      'Sente dores no ouvido, cabeça, face, nuca ou pescoço',
      'Possui azia, má digestão, refluxo, úlcera ou gastrite',
      'Apresenta sangramento a escovação',
      'Seus dentes são sensíveis a mudança de temperatura ou a alimentos doces',
      'Range os dentes',
      'Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)',
      'Já se submeteu à Ortodontia (aparelhos e correção)',
      'Já se submeteu à Periodontia (tratamento gengival)',
      'Já se submeteu à Endodontia (tratamento de canal)',
      'Quando foi sua última vez que veio ao dentista? Como foi o atendimento',
      'Quantas vezes por dia escova os dentes',
      'Usa creme dental',
      'Usa fio dental',
      'Faz uso de antisséptico bucal',
      'Come muitos doces, balas entre outros',
      'Tem hábito de tomar café ou refrigerantes',
      'Tem o hábito de roer unha ou morder objetos (lápis, caneta, etc.)',
      'A criança nasceu com parto normal ou cesariana',
      'Peso ao nascer',
      'Realiza(ou) aleitamento materno',
      'Realiza(ou) o uso de mamadeira ou chupeta',
      'Apresenta alguma alteração de língua, lábio e/ou palato',
      'Apresenta outra alteração na face não mencionada?',
    ];

    const defaultOptions = JSON.stringify([
      { value: 'Sim', Option: 'Sim' },
      { value: 'Não', Option: 'Não' },
      { value: 'Não sei', Option: 'Não sei' },
    ]);

    const config = await this.anamneseConfigModel.create({
      accountId: this.tenantService.tenant.id,
      desc: 'Anamnese Infantil',
      active: true,
      templateId: null,
      userCreated: null,
    });

    const items = questions.map((question, index) => ({
      accountId: this.tenantService.tenant.id,
      anamneseConfigId: config.id,
      seq: index + 1,
      question,
      options: defaultOptions,
      questionType: 'YES_NO',
      required: false,
      alert: false,
      userCreated: null,
    }));

    await this.anamneseConfigItemModel.bulkCreate(items);

    return config;
  }

  private async createAnamneseOrtodontica() {
    const questions = [
      'Possui alguma alergia? (Como penicilinas, AAS ou outra)',
      'Está em tratamento médico?',
      'Tem pressão alta?',
      'Sente alguma dor nos dentes ou na boca?',
      'Está usando medicação?',
      'Já esteve internado?',
      'Já teve hemorragia diagnosticada?',
      'Possui alguma alteração sanguínea?',
      'Possui diabetes?',
      'Possui asma?',
      'Possui anemia?',
      'Possui alguma disfunção hepática?',
      'Apresenta alguma disfunção renal?',
      'Possui alguma disfunção respiratória?',
      'Possui alguma alteração óssea?',
      'Possui alguma doença transmissível?',
      'Possui depressão?',
      'Está ou esteve em tratamento psicológico?',
      'Possui algum antecendente de endocardite bacteriana?',
      'Possui alguma outra doença/síndrome não mencionada?',
      'Já sofreu alguma reação alérgica ao receber anestesia?',
      'Tem dificuldade de abrir a boca?',
      'Sente dores no ouvido, cabeça, face, nuca ou pescoço?',
      'Possui azia, má digestão, refluxo, úlcera ou gastrite?',
      'Apresenta sangramento a escovação?',
      'Seus dentes são sensíveis a mudança de temperatura ou a alimentos doces?',
      'Range os dentes?',
      'Já se submeteu à Cirurgia Oral (exodontia, freio labial, etc.)?',
      'Já se submeteu à Ortodontia (aparelhos e correção)?',
      'Já se submeteu à Periodontia (tratamento gengival)?',
      'Já se submeteu à Endodontia (tratamento de canal)?',
      'Já se submeteu à Profilaxia / Prevenção (limpeza, flúor, selante oclusal, etc.)?',
      'Quando foi sua última vez que veio ao dentista? Como foi o atendimento?',
      'Quantas vezes por dia escova os dentes?',
      'Usa creme dental?',
      'Usa fio dental?',
      'Faz uso de antisséptico bucal?',
      'Come muitos doces, balas entre outros?',
      'Tem hábito de tomar café ou refrigerantes?',
      'Tem o hábito de roer unha ou morder objetos (lápis, caneta, etc.)?',
      'A criança nasceu com parto normal ou cesariana?',
      'Peso ao nascer?',
      'Realiza(ou) aleitamento materno?',
      'Realiza(ou) o uso de mamadeira ou chupeta?',
      'Realiza(ou) sucção de dedo ou lábio?',
      'Qual a sobremordida? (aumentada, normal ou aberta)',
      'Qual o trespasse horizontal? (aumentado, normal ou negativo)',
      'Possui mordida cruzada?',
      'O paciente possiu alguma alteração ganglionar?',
      'Apresenta alguma alteração de língua, lábio e/ou palato?',
      'Apresenta outra alteração na face não mencionada?',
    ];

    const defaultOptions = JSON.stringify([
      { value: 'Sim', Option: 'Sim' },
      { value: 'Não', Option: 'Não' },
      { value: 'Não sei', Option: 'Não sei' },
    ]);

    const config = await this.anamneseConfigModel.create({
      accountId: this.tenantService.tenant.id,
      desc: 'Anamnese Ortodôntica',
      active: true,
      templateId: null,
      userCreated: null,
    });

    const items = questions.map((q, index) => ({
      accountId: this.tenantService.tenant.id,
      anamneseConfigId: config.id,
      seq: index + 1,
      question: q,
      options: defaultOptions,
      questionType: 'YES_NO',
      required: false,
      alert: false,
      userCreated: null,
    }));

    await this.anamneseConfigItemModel.bulkCreate(items);

    return config;
  }

  private async createAnamneseEstetica() {
    const questions = [
      'Já realizou procedimentos estéticos?',
      'Quais?',
      'Houve melhora?',
      'Já fez aplicação de Toxina Botulínica?',
      'Já fez algum preenchimento dérmico?',
      'Usa ou já usou ácidos na pele?',
      'Onde e quando?',
      'Faz o uso de protetor solar?',
      'FPS?',
      'Usa algum cosmético?',
      'Reaplica?',
      'Quantas vezes?',
      'Rotina de cuidados?',
      'Quando toma sol como sua pele se comporta?',
      'Possui manchas de sol?',
      'Como é sua pele?',
      'Como sente sua pele?',
      'Possui Efélides (sardas)?',
      'Possui telangectasias?',
      'Região:',
      'Possui melasma?',
      'Quando se machuca tende a ficar manchado(a) no local da casquinha, por exemplo?',
      'Tem ou já apresentou, em alguma fase da vida, acne?',
      'Faz algum tipo de depilação?',
      'Pratica atividade física?',
      'Tem rosácea?',
      'Tem foliculite (pelo encravado)?',
      'Possui dermatite?',
      'Qual?',
      'Possui alguma lesão suspeita?',
      'Onde?',
      'Frequência:',
      'Como funciona o seu intestino?',
      'Qual a quantidade de água ingerida por dia:',
      'Descreva um dia de sua alimentação:',
      'Faz acompanhamento alimentar?',
      'Com qual profissional Faz acompanhamento?',
      'Intolerância alimentar?',
      'A que?',
      'E alergia alimentar?',
      'A que é alérgico?',
      'Retém líquido com frequência?',
      'Ganha peso ou perde peso com facilidade?',
      'Ingere bebida alcoólica?',
      'Fuma?',
      'Toma café?',
      'Qtd dia?',
      'Quantos cigarros por dia?',
      'Como é seu sono?',
      'Quantas horas/noite:',
      'Acorda com frequência durante à noite?',
      'Quando acorda sente-se descansado(a)?',
      'Já fez alguma cirurgia?',
      'Como foi sua recuperação?',
      'Possui alguma prótese?',
      'Qual parte do corpo?',
      'Há quanto tempo?',
      'Faz o uso de algum hormônio?',
      'Faz o uso de algum suplemento?',
      'Faz algum acompanhamento médico?',
      'Faz exame periodicamente?',
      'Tem alergia a algum produto ou medicamento?',
      'Faz ou fez (último mês) uso de algum medicamento?',
      'Qual(is)?',
      'Com qual profissional?',
      'Última vez?',
      'A que ?',
      'Qual(is) ?',
      'Houve alguma alteração no último exame?',
      'Histórico de doença na família?',
      'Como é sua menstruação?',
      'Usa anticoncepcional?',
      'Faz uso de DIU?',
      'Pode estar grávida?',
      'Já ficou grávida?',
      'Sofreu aborto?',
      'Possui ou sofre alguma das opções abaixo?',
      'Possui deficiência de vitaminas?',
      'Quais vitaminas?',
      'Faz reposição?',
      'Com?',
      'Faz uso de antidepressivo?',
      'Qual antidepressivo?',
      'Permanece muito tempo sentado?',
      'Horas:',
      'Possui marcapasso?',
      'Possui anemia?',
      'Possui algum problema circulatório?',
      'Possui diabetes?',
      'Possui algum distúrbio hormonal?',
      'Possui lúpus?',
      'Possui psoríase?',
      'Cabelos e/ou unhas quebradiços?',
      'Possui algum distúrbio na tireoide?',
      'Distúrbio hepático (fígado)?',
      'Distúrbio renal (rins)?',
      'Tumor?',
      'Quando?',
      'Possui algum problema gástrico?',
      'Gastrite?',
      'Refluxo?',
      'Faz tratamento?',
      'Possui algum problema de cicatrização?',
      'Tem histórico de cicatriz hipertrófica?',
      'Possui mioma?',
      'Cisto no ovário?',
      'Endometriose?',
      'Queloide?',
      'Tem ou teve herpes labial ou em outro lugar do rosto?',
      'Onde teve herpes labial?',
      'Como é sua pressão arterial?',
      'Faz controle da pressão arterial?',
      'É ansioso?',
      'É estressado?',
      'Teve Covid?',
      'Tomou vacina?',
      'Quando Tomou vacina?',
      'Com qual medicação?',
      'Sua gengiva costuma sangrar?',
      'Possui alguma doença ou há alguma informação que não foi perguntada que deseja informar?',
      'Fale sobre:',
    ];

    const defaultOptions = JSON.stringify([
      { value: 'Sim', Option: 'Sim' },
      { value: 'Não', Option: 'Não' },
      { value: 'Não sei', Option: 'Não sei' },
    ]);

    const config = await this.anamneseConfigModel.create({
      accountId: this.tenantService.tenant.id,
      desc: 'Anamnese Estética',
      active: true,
      templateId: null,
      userCreated: null,
    });

    const items = questions.map((q, index) => ({
      accountId: this.tenantService.tenant.id,
      anamneseConfigId: config.id,
      seq: index + 1,
      question: q,
      options: defaultOptions,
      questionType: 'YES_NO_TEXT',
      required: false,
      alert: false,
      userCreated: null,
    }));

    await this.anamneseConfigItemModel.bulkCreate(items);

    return config;
  }

  private async createAnamneseHOF() {
    const questions = [
      {
        question: 'Faz algum uso de medicamento momentâneo e/ou contínuo?',
        type: 'YES_NO_TEXT',
      },
      {
        question:
          'Possui algum tipo de alergia a algum medicamento, anestesia e/ou insetos?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Usa ou já usou algum tipo de ácido na pele?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Faz algum tipo de cuidado diário na pele?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Está sobre algum tipo de tratamento médico?',
        type: 'YES_NO_TEXT',
      },
      {
        question:
          'Tem alguma formação sólida na pele (Ex: nódulos, pápula, sequela etc)?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Faz uso de reposição hormonal?', type: 'YES_NO_TEXT' },
      {
        question:
          'Tem alguma doença infectocontagiosa (Ex: Hepatite B e C, HIV, sífilis, ETC)?',
        type: 'YES_NO_TEXT',
      },
      {
        question:
          'Tem alguma alteração vascular (Ex: petéquias, cianose, eritema etc)?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Possui alguma doença cardiovascular?', type: 'YES_NO_TEXT' },
      {
        question: 'Tem ou já teve algum distúrbio respiratório?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Já sofreu algum trauma na face?', type: 'YES_NO_TEXT' },
      {
        question: 'Já sofreu algum desmaio ou convulsão?',
        type: 'YES_NO_TEXT',
      },
      {
        question:
          'Tem alguma doença nos órgãos (Ex: coração, rim, fígado, etc)?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Possui diabetes e/ou outra doença autoimune?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Possui predisposição para queloides?', type: 'YES_NO' },
      { question: 'Tem hematomas com facilidade?', type: 'YES_NO' },
      {
        question: 'Possui alguma prótese facial ou corporal?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Faz uso de bebidas alcoólicas e/ou é fumante?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Possui alguma doença que interfira na coagulação do sangue?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Tem previsão de viagem a passeio nos próximos 60 dias?',
        type: 'YES_NO',
      },
      {
        question:
          'Possui transtorno de imagem, dismorfia corporal ou quadro depressivo?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Tem muita exposição ao sol?', type: 'YES_NO' },
      {
        question:
          'Já teve problemas de ansiedade ou se sentiu excessivamente preocupado(a) com algum aspecto da sua aparência?',
        type: 'YES_NO',
      },
      { question: 'Pratica exercícios físicos?', type: 'YES_NO_TEXT' },
      {
        question: 'Qual a sua expectativa relacionada ao resultado final?',
        type: 'TEXT',
      },
      {
        question:
          'Você já teve algum problema (dano ou insatisfação de resultado) em tratamentos anteriores?',
        type: 'YES_NO_TEXT',
      },
      {
        question:
          'Possui alguma doença neurológica (Esclerose, Síndrome de Guillain-Barré, Miastenia)?',
        type: 'YES_NO_TEXT',
      },
      {
        question:
          'Durante o tratamento, qual é a sua preferência em relação às explicações do profissional?',
        type: 'TEXT',
      },
      {
        question:
          'Quando está em atendimento, você prefere conversar bastante, conversar pouco ou apenas observar?',
        type: 'TEXT',
      },
      {
        question: 'Já fez algum tipo de tratamento estético ou cirúrgico?',
        type: 'YES_NO_TEXT',
      },
      {
        question: 'Já fez algum procedimento estético com PMMA?',
        type: 'YES_NO',
      },
      { question: 'Possui alguma patologia dermatológica?', type: 'YES_NO' },
      {
        question:
          'Possui manchas na pele (Ex: hipocromia, cloasma, melasma, etc)?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Possui varizes e/ou varicoses?', type: 'YES_NO_TEXT' },
      { question: 'Faz uso de Roacutan?', type: 'YES_NO' },
      { question: 'Possui hereditariedade de acne?', type: 'YES_NO' },
      {
        question: 'Possui cachorro(s) ou gato(s) na residência?',
        type: 'YES_NO',
      },
      {
        question: 'Já fez algum procedimento de harmonização facial ou botox?',
        type: 'YES_NO_TEXT',
      },
      { question: 'Possui alguma doença muscular?', type: 'YES_NO' },
      {
        question:
          'Sangra muito quando é ferido ou já teve algum episódio de hemorragia?',
        type: 'YES_NO',
      },
      {
        question:
          'Teve diagnóstico da Covid-19 e/ou tomou alguma dose da vacina?',
        type: 'YES_NO',
      },
      {
        question:
          'Você se sente pressionado(a) por outras pessoas ou pela mídia em relação à sua aparência?',
        type: 'YES_NO',
      },
      {
        question:
          'Como você descreveria o seu nível de autoestima em relação à sua aparência?',
        type: 'TEXT',
      },
      {
        question: 'Tem alguma contraindicação à ingestão de corticoide?',
        type: 'YES_NO',
      },
      {
        question:
          'Já recebeu comentários negativos sobre sua aparência? Como isso afetou você?',
        type: 'TEXT',
      },
      {
        question:
          'Em uma escala de 0 a 10, qual é o nível de importância que você atribui ao procedimento estético em sua vida?',
        type: 'TEXT',
      },
      {
        question:
          'Como você reagiria caso os resultados do procedimento não atendessem completamente suas expectativas?',
        type: 'TEXT',
      },
    ];

    const defaultOptions = JSON.stringify([
      { value: 'Sim', Option: 'Sim' },
      { value: 'Não', Option: 'Não' },
      { value: 'Não sei', Option: 'Não sei' },
    ]);

    const config = await this.anamneseConfigModel.create({
      accountId: this.tenantService.tenant.id,
      desc: 'Protocolo HOF',
      active: true,
      templateId: null,
      userCreated: null,
    });

    const items = questions.map((q, index) => {
      let options;
      if (q.type === 'YES_NO_TEXT') {
        options = defaultOptions;
      } else if (q.type === 'YES_NO') {
        options = JSON.stringify([
          { value: 'Sim', Option: 'Sim' },
          { value: 'Não', Option: 'Não' },
        ]);
      } else {
        options = JSON.stringify([]);
      }

      return {
        accountId: this.tenantService.tenant.id,
        anamneseConfigId: config.id,
        seq: index + 1,
        question: q.question,
        options,
        questionType: q.type,
        required: false,
        alert: false,
        userCreated: null,
      };
    });

    await this.anamneseConfigItemModel.bulkCreate(items);

    return config;
  }
}
