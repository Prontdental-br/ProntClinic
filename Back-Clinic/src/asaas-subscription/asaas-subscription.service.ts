/* eslint-disable prettier/prettier */
import axios from 'axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { AsaasCustomer, CreateAsaasCustomer } from 'src/clinics/interfaces';
import { AccountsService } from 'src/accounts/accounts.service';
import { UpdateAccountDto } from 'src/accounts/dto/update-account.dto';
import { TenantService } from 'src/tenant/tenant/tenant.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Account } from 'src/accounts/entities/account.entity';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import AsaasAccount from 'src/accounts/entities/asaasAcount.entity';
import * as moment from 'moment';
import { PromotionalCode } from 'src/promotional-code/entities/promotional-code.entity';
import { PromotionalCodeService } from 'src/promotional-code/promotional-code.service';

@Injectable()
export class AsaasSubscriptionService {
  constructor(
    private readonly accountsService: AccountsService,
    private tenantService: TenantService,
    private promotionalCodeService: PromotionalCodeService,
  ) {}

  private getDateInSevenDays() {
    const today = new Date();
    const fiveDaysLater = new Date(today.setDate(today.getDate() + 7));

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

  private async createAsaasSubscriptions(
    customerId: string,
    body: { cycle: string; value: number },
  ) {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const config = {
      headers: {
        access_token: apiKey,
      },
    };
    const res = await axios.post(
      `${process.env.ASAAS_SANDBOX_URL}/subscriptions`,
      {
        customer: customerId,
        billingType: 'BOLETO',
        cycle: body.cycle,
        value: body.value,
        nextDueDate: this.getDateInSevenDays(),
      },
      config,
    );

    return res.data;
  }

  async createAsaasCustomer(userData: any) {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const config = {
      headers: {
        access_token: apiKey,
      },
    };
    const { data }: { data: AsaasCustomer } = await axios.post(
      `${process.env.ASAAS_SANDBOX_URL}/customers`,
      {
        externalReference: userData['id'],
        name: userData['name'],
        cpfCnpj: userData['document'].replace(/\D/g, ''),
        email: userData['email'],
      },
      config,
    );
    return data.id;
  }

  async createPaymentWithoutSubscription(data: {
    customer: string;
    value: number;
    billingType?: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
    externalReference?: string;
    dueDate: string;
  }) {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const res = await axios.post(
      `${process.env.ASAAS_SANDBOX_URL}/payments`,
      {
        customer: data.customer,
        value: data.value,
        dueDate: data.dueDate,
        billingType: data.billingType ?? 'BOLETO',
        externalReference: data.externalReference,
      },
      {
        headers: {
          access_token: apiKey,
        },
      },
    );
    return res.data;
  }

  async generatePaymentByMethod(
    accountId: string,
    method: 'CREDIT_CARD' | 'PIX',
  ) {
    const customer = await this.getCustomerByAccountId(
      this.tenantService.tenant.id,
    );

    const customerId = customer[0]?.id;

    const payment = await this.createPaymentWithoutSubscription({
      customer: customerId,
      value: 1.0,
      billingType: method,
      dueDate: this.getTodayDate(),
      externalReference: JSON.stringify({
        planType: 'P',
        type: 'first_charge',
      }),
    });

    console.log(payment);

    return payment.invoiceUrl;
  }

  async startMonthlyPlanAfterInitialPayment(
    customerId: string,
    planType: string,
    coupon?: { id: string; name: string; discountPercent: number },
  ) {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const values = { P: 297.0 };
    let value = values[planType] ?? 297;

    const externalRef: any = { planType };

    if (coupon) {
      const discount = value * (coupon.discountPercent / 100);
      value = value - discount;
      // externalRef.couponId = coupon.id;
      externalRef.couponName = coupon.name;
      // externalRef.discountPercent = coupon.discountPercent;
      externalRef.discountMonths = 2;
      externalRef.currentDiscountMonth = 0;
    }

    const res = await axios.post(
      `${process.env.ASAAS_SANDBOX_URL}/subscriptions`,
      {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        cycle: 'MONTHLY',
        value,
        nextDueDate: this.calculateNextDueDate(30),
        externalReference: JSON.stringify(externalRef),
      },
      {
        headers: {
          access_token: apiKey,
        },
      },
    );

    return res.data;
  }

  // async startMonthlyPlanAfterInitialPayment(
  //   customerId: string,
  //   planType: string,
  // ) {
  //   const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
  //   const values = { P: 297.0 };

  //   const value = values[planType] ?? 297;

  //   const res = await axios.post(
  //     `${process.env.ASAAS_SANDBOX_URL}/subscriptions`,
  //     {
  //       customer: customerId,
  //       billingType: 'CREDIT_CARD',
  //       cycle: 'MONTHLY',
  //       value,
  //       nextDueDate: this.calculateNextDueDate(15),
  //       externalReference: JSON.stringify({ planType }),
  //     },
  //     {
  //       headers: {
  //         access_token: apiKey,
  //       },
  //     },
  //   );

  //   return res.data;
  // }

  private async getCustomerByEmail(
    email: string,
  ): Promise<AsaasCustomer[] | null> {
    try {
      const url = `${process.env.ASAAS_SANDBOX_URL}/customers`;
      const options = {
        method: 'GET',
        params: { email },
        headers: {
          accept: 'application/json',
          access_token: `$aact_${process.env.ASAAS_API_KEY}`,
        },
      };
      const res = await axios.get(url, options);
      return res.data.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async getCustomerByAccountId(
    id: string,
  ): Promise<AsaasCustomer[] | null> {
    try {
      const url = `${process.env.ASAAS_SANDBOX_URL}/customers`;
      const options = {
        method: 'GET',
        params: { externalReference: id },
        headers: {
          accept: 'application/json',
          access_token: `$aact_${process.env.ASAAS_API_KEY}`,
        },
      };
      const res = await axios.get(url, options);
      return res.data.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async getCustomerById(
    customerId: string,
  ): Promise<AsaasCustomer | null> {
    try {
      const url = `${process.env.ASAAS_SANDBOX_URL}/customers/${customerId}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          access_token: `$aact_${process.env.ASAAS_API_KEY}`,
        },
      };
      const res = await axios.get(url, options);
      return res.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async createSubAccount(accountData: Account, email: string) {
    console.log(accountData.clinic);
    try {
      const { data } = await axios.post(
        `${process.env.ASAAS_SANDBOX_URL}/accounts`,
        {
          name: accountData?.name,
          email: email,
          loginEmail: email,
          phone: accountData.cellPhone,
          address: accountData.clinic.street
            ? accountData.clinic.street
            : 'rua teste',
          addressNumber: accountData.clinic.addressNumber
            ? accountData.clinic.addressNumber
            : '123',
          province: accountData.clinic.state ? accountData.clinic.state : 'TO',
          postalCode: accountData.clinic.cep
            ? accountData.clinic.cep?.replaceAll('.', '').replaceAll('-', '')
            : '77817020',
          cpfCnpj: accountData.clinic.docNumber
            ? accountData.clinic.docNumber
                ?.replaceAll('.', '')
                .replaceAll('-', '')
            : '03173428005',
          mobilePhone: accountData.cellPhone,
          birthDate: accountData.clinic.birthday,
          incomeValue: 10000,
          companyType: 'LIMITED',
        },
        {
          headers: {
            accept: 'application/json',
            access_token: `$aact_${process.env.ASAAS_API_KEY}`,
          },
        },
      );
      await AsaasAccount.create({
        active: true,
        asaas_account_id: data.id,
        wallet_id: data.walletId,
        asaas_api_key: data.apiKey,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async handleSubscriptionStatusUpdate(data: any) {
    const update = new UpdateAccountDto();

    if (data.event === 'PAYMENT_CREATED') {
      return;
    }

    if (
      data.event === 'PAYMENT_RECEIVED' ||
      data.event === 'PAYMENT_CONFIRMED'
    ) {
      const customer = await this.getCustomerById(data.payment.customer);
      const subscription = data.payment.subscription;

      if (!customer) {
        console.warn(
          `Cliente não encontrado no Asaas: ${data.payment.customer}`,
        );
        return;
      }

      const accountData = await this.accountsService.findOne(
        customer.externalReference,
      );

      let parsedData: any = {};
      let planType: string | null = null;

      try {
        if (typeof data?.payment?.externalReference === 'string') {
          parsedData = JSON.parse(data.payment.externalReference);
          planType = parsedData?.planType || null;
        }
      } catch (error) {
        console.warn('Erro ao fazer parse de externalReference:', error);
        parsedData = {};
      }

      if (!accountData) {
        return;
      }

      if (parsedData?.couponName && accountData?.couponId) {
        const coupon = await this.promotionalCodeService.findById(
          accountData.couponId,
        );

        if (coupon && coupon.name === parsedData.couponName) {
          const monthsUsed = (parsedData.currentDiscountMonth || 0) + 1;
          parsedData.currentDiscountMonth = monthsUsed;

          if (monthsUsed >= (parsedData.discountMonths ?? 0)) {
            await this.updateAsaasSubscription(subscription, {
              value: 297,
              externalReference: JSON.stringify({
                planType: parsedData.planType,
              }),
            });
          } else {
            await this.updateAsaasSubscription(subscription, {
              externalReference: JSON.stringify(parsedData),
            });
          }
        }
      }

      update.active = true;
      update.expiresIn = null;
      update.expiredSubscription = false;

      if (planType) {
        update.planType = planType;
      }
      await this.accountsService.update(customer.externalReference, update);

      console.log('DADOS do EXTERNAL_REFERENCE ---', parsedData);

      if (parsedData?.type === 'first_charge') {
        return;
        // const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
        // const existingSubscriptions = await axios.get(
        //   `${process.env.ASAAS_SANDBOX_URL}/subscriptions?customer=${customer.id}`,
        //   { headers: { access_token: apiKey } },
        // );

        // if (existingSubscriptions.data.totalCount === 0) {
        //   const coupon = accountData?.couponId
        //   ? await this.promotionalCodeService.findById(accountData.couponId)
        //   : null;

        //   if (coupon) {
        //     await this.startMonthlyPlanAfterInitialPayment(customer.id, planType, {
        //       name: coupon.name,
        //       discountPercent: coupon.percentage,
        //     });
        //   } else {
        //     await this.startMonthlyPlanAfterInitialPayment(customer.id, planType);
        //   }
        // }
      }

      return;
    }

    if (data.event === 'PAYMENT_OVERDUE') {
      let parsedData: any = {};
      try {
        if (typeof data?.payment?.externalReference === 'string') {
          parsedData = JSON.parse(data.payment.externalReference);
        }
      } catch (error) {
        parsedData = {};
      }

      const isFirstCharge = parsedData?.type === 'first_charge';
      const isSubscriptionPayment =
        data.payment.subscription || parsedData?.type === 'subscription';

      if (!isFirstCharge && !isSubscriptionPayment) {
        console.log(
          'Cobrança não é da assinatura nem da first_charge, não bloqueando.',
        );
        return;
      }

      const customer = await this.getCustomerById(data.payment.customer);
      update.active = false;
      update.expiresIn = null;
      update.expiredSubscription = true;
      await this.accountsService.update(customer.externalReference, update);

      console.log(
        'Conta bloqueada por falta de pagamento da assinatura ou first_charge',
      );
      return;
    }

    if (data.subscription) {
      const customerData = await this.getCustomerById(
        data.subscription.customer,
      );
      if (!customerData) return;
      const status = data.subscription.status;
      const accountId = customerData.externalReference;

      switch (data.event) {
        case 'SUBSCRIPTION_UPDATED':
          if (status === 'ACTIVE') {
            update.active = true;
            update.expiredSubscription = false;
            await this.accountsService.update(accountId, update);
          }
          if (status === 'EXPIRED' || status === 'INACTIVE') {
            update.active = false;
            update.expiredSubscription = true;
            await this.accountsService.update(accountId, update);
          }
          break;
        case 'SUBSCRIPTION_INACTIVATED':
        case 'SUBSCRIPTION_DELETED':
          update.active = false;
          update.expiredSubscription = true;
          await this.accountsService.update(accountId, update);
          break;
      }
    }
  }

  // async handleSubscriptionStatusUpdate(data: any) {
  //   const update = new UpdateAccountDto();

  //   if (data.event === 'PAYMENT_CREATED') {
  //     return;
  //   }

  //   if (
  //     data.event === 'PAYMENT_RECEIVED' ||
  //     data.event === 'PAYMENT_CONFIRMED'
  //   ) {
  //     const customer = await this.getCustomerById(data.payment.customer);

  //     if (!customer) {
  //       console.warn(
  //         `Cliente não encontrado no Asaas: ${data.payment.customer}`,
  //       );
  //       return;
  //     }

  //     // const customerData = await this.accountsService.findOne(customer.externalReference);

  //     let parsedData: any = {};
  //     let planType: string | null = null;

  //     try {
  //       if (typeof data?.payment?.externalReference === 'string') {
  //         parsedData = JSON.parse(data.payment.externalReference);
  //         planType = parsedData?.planType || null;
  //       }
  //     } catch (error) {
  //       console.warn('Erro ao fazer parse de externalReference:', error);
  //       parsedData = {};
  //     }

  //     update.active = true;
  //     update.expiresIn = null;
  //     update.expiredSubscription = false;

  //     if (planType) {
  //       update.planType = planType;
  //     }
  //     await this.accountsService.update(customer.externalReference, update);

  //     console.log('DADOS do EXTERNAL_REFERENCE ---', parsedData);

  //     if (parsedData?.type === 'first_charge') {
  //       const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
  //       try {
  //         const existingSubscriptions = await axios.get(
  //           `${process.env.ASAAS_SANDBOX_URL}/subscriptions?customer=${customer.id}`,
  //           { headers: { access_token: apiKey } },
  //         );

  //         if (existingSubscriptions.data.totalCount === 0) {
  //           await this.startMonthlyPlanAfterInitialPayment(
  //             customer.id,
  //             planType,
  //           );
  //         }
  //       } catch (err) {
  //         console.error(
  //           'Erro ao buscar/criar assinatura no Asaas:',
  //           err.response?.data || err.message,
  //         );
  //         return;
  //       }
  //     }

  //     return;
  //   }

  //   if (data.event === 'PAYMENT_OVERDUE') {
  //     let parsedData: any = {};
  //     try {
  //       if (typeof data?.payment?.externalReference === 'string') {
  //         parsedData = JSON.parse(data.payment.externalReference);
  //       }
  //     } catch (error) {
  //       parsedData = {};
  //     }

  //     const isFirstCharge = parsedData?.type === 'first_charge';
  //     const isSubscriptionPayment =
  //       data.payment.subscription || parsedData?.type === 'subscription';

  //     if (!isFirstCharge && !isSubscriptionPayment) {
  //       console.log(
  //         'Cobrança não é da assinatura nem da first_charge, não bloqueando.',
  //       );
  //       return;
  //     }

  //     const customer = await this.getCustomerById(data.payment.customer);
  //     update.active = false;
  //     update.expiresIn = null;
  //     update.expiredSubscription = true;
  //     await this.accountsService.update(customer.externalReference, update);

  //     console.log(
  //       'Conta bloqueada por falta de pagamento da assinatura ou first_charge',
  //     );
  //     return;
  //   }

  //   if (data.subscription) {
  //     const customerData = await this.getCustomerById(
  //       data.subscription.customer,
  //     );
  //     if (!customerData) return;
  //     const status = data.subscription.status;
  //     const accountId = customerData.externalReference;

  //     switch (data.event) {
  //       case 'SUBSCRIPTION_UPDATED':
  //         if (status === 'ACTIVE') {
  //           update.active = true;
  //           update.expiredSubscription = false;
  //           await this.accountsService.update(accountId, update);
  //         }
  //         if (status === 'EXPIRED' || status === 'INACTIVE') {
  //           update.active = false;
  //           update.expiredSubscription = true;
  //           await this.accountsService.update(accountId, update);
  //         }
  //         break;
  //       case 'SUBSCRIPTION_INACTIVATED':
  //       case 'SUBSCRIPTION_DELETED':
  //         update.active = false;
  //         update.expiredSubscription = true;
  //         await this.accountsService.update(accountId, update);
  //         break;
  //     }
  //   }
  // }

  async getPaymentPending() {
    const customers = await this.getCustomerByAccountId(
      this.tenantService.tenant.id,
    );

    if (!customers || customers.length === 0) {
      return { paymentUrl: null };
    }

    const customerId = customers[0].id;

    const response = await axios.get(
      `${process.env.ASAAS_SANDBOX_URL}/payments`,
      {
        params: {
          customer: customerId,
          status: 'PENDING',
        },
        headers: {
          access_token: `$aact_${process.env.ASAAS_API_KEY}`,
        },
      },
    );

    const pendingPayments = response.data?.data;

    const paymentOfOne = pendingPayments?.find(
      (payment: any) => payment.value === 1,
    );

    if (paymentOfOne) {
      return { paymentUrl: paymentOfOne.invoiceUrl };
    }

    return { paymentUrl: null };
  }

  async getSubscriptionsByCustomerId(customerId: string): Promise<any[]> {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const res = await axios.get(
      `${process.env.ASAAS_SANDBOX_URL}/subscriptions?customer=${customerId}`,
      {
        headers: {
          access_token: apiKey,
        },
      },
    );
    return res.data.data;
  }

  async updateAsaasSubscription(subscriptionId: string, body: any) {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const res = await axios.put(
      `${process.env.ASAAS_SANDBOX_URL}/subscriptions/${subscriptionId}`,
      body,
      {
        headers: {
          access_token: apiKey,
        },
      },
    );

    return res.data;
  }

  async getPaymentsFromSubscription(
    subscriptionId: string,
    status: string,
  ): Promise<any[]> {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const res = await axios.get(
      `${process.env.ASAAS_SANDBOX_URL}/payments?subscription=${subscriptionId}&status=${status}`,
      {
        headers: {
          access_token: apiKey,
        },
      },
    );

    return res.data.data; // Retorna os pagamentos associados
  }

  async createPayment(
    subscriptionId: string,
    body: {
      value: number;
      dueDate: string;
      customer: string;
      externalReference?: string;
    },
  ) {
    const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
    const res = await axios.post(
      `${process.env.ASAAS_SANDBOX_URL}/payments`,
      {
        // subscription: subscriptionId,
        customer: body.customer,
        value: body.value,
        dueDate: body.dueDate,
        billingType: 'BOLETO',
        externalReference: body.externalReference,
      },
      {
        headers: {
          access_token: apiKey,
        },
      },
    );

    return res.data; // Retorna o pagamento criado
  }

  private async createAsaasSubscription(
    userData: CreateAsaasCustomer,
    cycle: string,
    value: number,
  ) {
    try {
      const apiKey = `$aact_${process.env.ASAAS_API_KEY}`;
      const config = {
        headers: {
          access_token: apiKey,
        },
      };
      const { data }: { data: AsaasCustomer } = await axios.post(
        `${process.env.ASAAS_SANDBOX_URL}/customers`,
        {
          externalReference: userData['id'],
          name: userData['name'],
          cpfCnpj: userData['document'].replace(/\D/g, ''),
          email: userData['email'],
        },
        config,
      );
      const customerId = data.id;
      const res = await axios.post(
        `${process.env.ASAAS_SANDBOX_URL}/subscriptions`,
        {
          customer: customerId,
          billingType: 'UNDEFINED',
          cycle,
          value: cycle === 'YEARLY' ? value * 12 : value,
          nextDueDate: this.getDateInSevenDays(),
        },
        config,
      );
      console.log(res.data, 'reeeee');
      return res.data;
    } catch (error) {
      console.error(error.response.data);
      console.error(error);
    }
  }

  async updateSubscription(data: UpdateSubscriptionDto) {
    try {
      const accountId = this.tenantService.userTenant.accountId;
      const customer = await this.getCustomerByAccountId(accountId);

      const values = {
        monthly: { essencial: 147.0, prime: 297.0 },
        // yearly: { standard: 103.9, premium: 199.9 },
      };

      if (customer.length === 0) {
        // Nenhum cliente encontrado, cria o cadastro + assinatura
        const asaasData = await this.createAsaasSubscription(
          {
            id: accountId,
            document: this.tenantService.tenant.clinic.docNumber,
            email: this.tenantService.userTenant.email,
            name: this.tenantService.tenant.clinic.name,
          },
          data.type.toUpperCase(),
          values[data.type][data.planName],
        );

        const pendingPayments = await this.getPaymentsFromSubscription(
          asaasData.id,
          'PENDING',
        );

        if (pendingPayments.length > 0) {
          return pendingPayments[0]['invoiceUrl'];
        }

        return null;
      }

      const newValue = values[data.type][data.planName];
      const cycle = data.type.toUpperCase();

      const subscriptions = await this.getSubscriptionsByCustomerId(
        customer[0].id,
      );

      if (subscriptions.length === 0) {
        throw new Error('Nenhuma assinatura encontrada para este cliente');
      }

      const subscription = subscriptions[0];
      const subscriptionId = subscription.id;
      const currentValue = subscription.value;
      const isDowngrade = newValue < currentValue;

      const updatePayload: any = {
        cycle,
        value: cycle === 'YEARLY' ? newValue * 12 : newValue,
        externalReference: JSON.stringify({
          planType: data.planName[0].toUpperCase(),
        }),
      };

      if (isDowngrade) {
        updatePayload.updatePendingPayments = true;
      }

      console.log('PAYLOAD FINAL', updatePayload);

      const updatedAsaas = await this.updateAsaasSubscription(
        subscriptionId,
        updatePayload,
      );

      console.log('ATUALIZAÇÃO PLANO --------', updatedAsaas);

      const updateAccount = new UpdateAccountDto();
      updateAccount.planType = data.planName[0].toUpperCase();

      await this.accountsService.update(accountId, updateAccount);

      const pendingPayments = await this.getPaymentsFromSubscription(
        subscriptionId,
        'PENDING',
      );

      if (pendingPayments.length > 0) {
        return pendingPayments[0]['invoiceUrl'];
      }

      return null;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Erro ao atualizar assinatura');
    }
  }

  calculateNextDueDate(days = 7): string {
    const today = new Date();
    today.setDate(today.getDate() + days);
    return today.toISOString().split('T')[0];
  }
}
