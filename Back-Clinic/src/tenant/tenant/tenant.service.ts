/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account } from 'src/accounts/entities/account.entity';
import { TenantException } from '../exception/TenantException';
import { BlockedTenantException } from '../exception/BlockedTenantException';
import { User } from 'src/users/entities/user.entity';
import { ExpiredSubscriptionException } from '../exception/ExpiredSubscriptionException';
import * as moment from 'moment';
import { Clinic } from 'src/clinics/entities/clinic.entity';
import { AsaasSubscriptionService } from 'src/asaas-subscription/asaas-subscription.service';
import axios from 'axios';
import { AsaasCustomer } from 'src/clinics/interfaces';

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private user: User | null = null;
  private account: Account | null = null;

  constructor(
    @InjectModel(Account) private accountModel: typeof Account,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  get tenant() {
    return this.account;
  }

  set tenant(tenant: Account) {
    this.account = tenant;
  }

  get userTenant() {
    return this.user;
  }

  set userTenant(user: User) {
    this.user = user;
  }

  // tenant with coupon logic
  async setTenantBy(accountId: string, ignoreExpiredSubscription = true) {
    const data: any = await this.accountModel
      .findOne({
        where: {
          id: accountId,
        },
        rejectOnEmpty: true,
      })
      .catch((err) => {
        console.log(err);
        switch (err.name) {
          case 'SequelizeEmptyResultError':
            console.log('**++**' + JSON.stringify(err));
            throw new TenantException();

          default:
            throw err;
        }
      });
    this.tenant = data;

    const schema = `${process.env.NAME_SCHEMA_CLIENT}${this.tenant?.idSeq}`;

    const clinic = await Clinic.schema(schema).findOne();

    this.tenant.clinic = clinic;

    if (ignoreExpiredSubscription === true && this.tenant.expiredSubscription) {
      return;
    }

    const accountCreationDate = moment(data?.created_at);

    const cutoffDate = moment('2025-06-17');

    if (accountCreationDate.isBefore(cutoffDate)) {
      return;
    }

    const now = moment();
    const created = moment(this.tenant.clinic?.createdAt);
    const expiresAt = moment(created).add(this.tenant.expiresIn, 'seconds');

    if (
      this.tenant.expiredSubscription ||
      (this.tenant.expiresIn && now.isAfter(expiresAt))
    ) {
      this.tenant.expiredSubscription = true;

      this.tenant.save();
      const { paymentUrl, fullPaymentLink, amount } =
        await this.getPaymentPending();
      throw new ExpiredSubscriptionException(
        paymentUrl,
        fullPaymentLink,
        amount,
      );
    }
    if (!this.tenant.active) throw new BlockedTenantException();
  }

  // async setTenantBy(accountId: string, ignoreExpiredSubscription = true) {
  //   const data: any = await this.accountModel
  //     .findOne({
  //       where: {
  //         id: accountId,
  //       },
  //       rejectOnEmpty: true,
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       switch (err.name) {
  //         case 'SequelizeEmptyResultError':
  //           console.log('**++**' + JSON.stringify(err));
  //           throw new TenantException();

  //         default:
  //           throw err;
  //       }
  //     });
  //   this.tenant = data;

  //   const schema = `${process.env.NAME_SCHEMA_CLIENT}${this.tenant?.idSeq}`;

  //   const clinic = await Clinic.schema(schema).findOne();

  //   this.tenant.clinic = clinic;

  //   if (ignoreExpiredSubscription === true && this.tenant.expiredSubscription) {
  //     return;
  //   }

  //   const accountCreationDate = moment(data?.created_at);

  //   const cutoffDate = moment('2025-06-17');

  //   if (accountCreationDate.isBefore(cutoffDate)) {
  //     return;
  //   }

  //   const now = moment();
  //   const created = moment(this.tenant.clinic?.createdAt);
  //   const expiresAt = moment(created).add(this.tenant.expiresIn, 'seconds');

  //   if (
  //     this.tenant.expiredSubscription ||
  //     (this.tenant.expiresIn && now.isAfter(expiresAt))
  //   ) {
  //     this.tenant.expiredSubscription = true;

  //     this.tenant.save();
  //     const { paymentUrl, fullPaymentUrl } = await this.getPaymentPending();
  //     throw new ExpiredSubscriptionException(paymentUrl, fullPaymentUrl);
  //   }
  //   if (!this.tenant.active) throw new BlockedTenantException();
  // }

  async setUserBy(userId: string, ignoreExpiredSubscription = true) {
    this.userTenant = await this.userModel
      .findOne({
        where: {
          id: userId,
        },
        rejectOnEmpty: true,
      })
      .catch((err) => {
        console.log(err);
        switch (err.name) {
          case 'SequelizeEmptyResultError':
            console.log('**++**' + JSON.stringify(err));
            throw new TenantException();

          default:
            throw err;
        }
      });
    if (!this.tenant.active) throw new BlockedTenantException();
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

  // old logic paymentPending
  async getPaymentPending() {
    const customers = await this.getCustomerByAccountId(this.tenant.id);

    if (!customers || customers.length === 0) {
      return { paymentUrl: null, paymentValue: null };
    }

    const customerId = customers[0].id;

    const pendingResponse = await axios.get(
      `${process.env.ASAAS_SANDBOX_URL}/payments`,
      {
        params: { customer: customerId, status: 'PENDING' },
        headers: { access_token: `$aact_${process.env.ASAAS_API_KEY}` },
      },
    );

    const pendingPayments = pendingResponse.data?.data || [];
    const pending = pendingPayments[0];

    const overdueResponse = await axios.get(
      `${process.env.ASAAS_SANDBOX_URL}/payments`,
      {
        params: { customer: customerId, status: 'OVERDUE' },
        headers: { access_token: `$aact_${process.env.ASAAS_API_KEY}` },
      },
    );

    const overduePayments = overdueResponse.data?.data || [];
    const overdue = overduePayments[0];

    const selectedPayment = pending || overdue;
    const overduePaymentLink = overduePayments?.invoiceUrl;

    return {
      paymentUrl: selectedPayment?.invoiceUrl || null,
      fullPaymentLink: overduePaymentLink || null,
      amount: selectedPayment?.value,
    };
  }

  // async getPaymentPending() {
  //   const customers = await this.getCustomerByAccountId(this.tenant.id);

  //   if (!customers || customers.length === 0) {
  //     return { paymentUrl: null, fullPaymentLink: null };
  //   }

  //   const customerId = customers[0].id;

  //   const pendingResponse = await axios.get(
  //     `${process.env.ASAAS_SANDBOX_URL}/payments`,
  //     {
  //       params: {
  //         customer: customerId,
  //         status: 'PENDING',
  //       },
  //       headers: {
  //         access_token: `$aact_${process.env.ASAAS_API_KEY}`,
  //       },
  //     },
  //   );

  //   const pendingPayments = pendingResponse.data?.data || [];

  //   const paymentOfOneRealPending = pendingPayments.find(
  //     (payment: any) => payment.value === 1,
  //   );

  //   const overdueResponse = await axios.get(
  //     `${process.env.ASAAS_SANDBOX_URL}/payments`,
  //     {
  //       params: {
  //         customer: customerId,
  //         status: 'OVERDUE',
  //       },
  //       headers: {
  //         access_token: `$aact_${process.env.ASAAS_API_KEY}`,
  //       },
  //     },
  //   );

  //   const overduePayments = overdueResponse.data?.data || [];

  //   const paymentOfOneRealOverdue = overduePayments.find(
  //     (payment: any) => payment.value === 1,
  //   );

  //   const fullPaymentOverdue = overduePayments.find(
  //     (payment: any) => payment.value === 297,
  //   );

  //   return {
  //     paymentUrl:
  //       paymentOfOneRealPending?.invoiceUrl ||
  //       paymentOfOneRealOverdue?.invoiceUrl ||
  //       null,

  //     fullPaymentUrl: fullPaymentOverdue?.invoiceUrl || null,
  //   };
  // }
}
