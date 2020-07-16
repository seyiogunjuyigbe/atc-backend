import * as createError from 'http-errors';
import * as config from '../../../config';
import endpointsUtil from '../../shared/util/endpoints';
import http from '../services/http';
import Notifier from './notifier';
import { Payment } from './payment';

export class Paystack {
  private endpoints;
  private static instance = null;
  private static currency = null;
  public AUTO_WITHDRAW_LIMIT = 10000;
  public config: any = {};

  public constructor(currency = 'NGN') {
    this.endpoints = endpointsUtil();

    this.config = {
      publicKey: config.get('api.paystack.publicKey'),
      secretKey: config.get('api.paystack.secretKey'),
      baseUrl: config.get('api.paystack.baseUrl'),
    };

    if (currency === 'USD') {
      this.AUTO_WITHDRAW_LIMIT = 1000;
    }
  }

  public async initiate(options) {
    const { user, transaction, paymentType } = options;
    const { amount, reference, currency } = transaction;

    const payableAmtNgn = amount * 100; // convert to kobo

    if (paymentType === 'newCard' || paymentType === 'account') {
      const payload = {
        reference,
        currency: currency.toUpperCase(),
        key: this.config.publicKey,
        email: user.email,
        amount: payableAmtNgn,
        firstname: user.firstName,
        lastname: user.lastName,
        channels: paymentType === 'newCard' ? ['card'] : ['bank'],
      };

      return await http.post(this.endpoints.initiatePayment, payload, {
        Authorization: `Bearer ${this.config.secretKey}`,
      });
    }
  }

  public async chargeSavedCard({ transaction, transactable, user }) {
    const { token } = transactable;
    const { amount, reference, currency } = transaction;

    const amountInKobo = amount * 100; // convert to kobo

    const payload = {
      reference,
      currency: currency.toUpperCase(),
      email: user.email,
      authorization_code: token,
      amount: amountInKobo,
    };

    return await http
      .post(this.endpoints.tokenCharge, payload, {
        Authorization: `Bearer ${this.config.secretKey}`,
      })
      .catch((err) => {
        console.log(err);

        console.error(`HTTP_POST::CHARGE_SAVED_CARD:: ${err}`);
        throw new Error('Transaction could not be initiated');
      });
  }

  public async validate(options) {
    const payload = {
      PBFPubKey: this.config.publicKey,
      transactionreference: options.providerReference,
      otp: options.otp,
    };

    return await http.post(this.endpoints.validatePayment, payload);
  }

  public async verify(options) {
    const response = await http.get(
      `${this.endpoints.verifyPayment}/${options.paymentRef}`,
      { Authorization: `Bearer ${this.config.secretKey}` },
    );

    const amount = response.data.amount / 100; // In kobo

    return {
      ...response,
      data: {
        ...response.data,
        amount,
      },
    };
  }

  public async createRecipient(payload) {
    const response = await http.post(this.endpoints.createRecipient, payload, {
      Authorization: `Bearer ${this.config.secretKey}`,
    });

    return response;
  }

  public async withdraw(options) {
    const { amountNgn, reference, bankAccount, user, narration } = options;

    if (!bankAccount) {
      throw createError(404, 'Bank account does not exist');
    }

    if (bankAccount.isIn('us')) {
      // @TODO
      // Run stripe stuff here
      throw createError(
        422,
        'US withdrawal processessing has not been implemented yet.',
      );
      // return await http.post(this.endpoints.createTransfer, {});
    }

    if (!bankAccount.paystackRecipientId) {
      const response = await this.createRecipient({
        type: 'nuban',
        name: user.name,
        account_number: bankAccount.number,
        bank_code: bankAccount.bank.code,
      });

      if (response.data.recipient_code) {
        bankAccount.paystackRecipientId = response.data.recipient_code;
        await bankAccount.save();
      }
    }

    const payload = {
      reference,
      source: 'balance',
      amount: Number((Number(amountNgn) * 100).toFixed(2)), // convert to kobo
      recipient: bankAccount.paystackRecipientId,
      reason: narration || 'Rise Vest Payout',
    };

    try {
      return await http.post(this.endpoints.createTransfer, payload, {
        Authorization: `Bearer ${this.config.secretKey}`,
      });
    } catch (error) {
      console.info({ error });
      Notifier.notify(
        'email',
        null,
        'Error: Payment Withdrawal',
        JSON.stringify(error),
      );
      return false;
    }
  }

  public async finalizeWithdrawal(options) {
    const { otp, providerReference } = options;

    const payload: any = {
      transfer_code: providerReference,
    };

    if (otp) {
      payload.otp = otp;
    }

    return await http.post(this.endpoints.finalizeTransfer, payload, {
      Authorization: `Bearer ${this.config.secretKey}`,
    });
  }

  public async getTransfer(options) {
    return await http.get(
      `${this.endpoints.getTransfer}/${options.transfer_code}`,
      { Authorization: `Bearer ${this.config.secretKey}` },
    );
  }

  public async verifyAccount(options) {
    try {
      const response = await http.get(
        this.endpoints.verifyAccount,
        { Authorization: `Bearer ${this.config.secretKey}` },
        { account_number: options.bankAccount, bank_code: options.bankCode },
      );

      return response;
    } catch (err) {
      Notifier.notify(
        'email',
        null,
        'Account Validation Failed',
        JSON.stringify(err),
      );
      return false;
    }
  }

  public isSuccessful({ status, data }) {
    return status && data && data.status === 'success';
  }

  public static processWithdrawal(options) {
    const payment = Paystack.getInstance('usd');

    return payment.withdraw(options);
  }

  public static getInstance(currency) {
    if (
      !Paystack.instance &&
      (!Paystack.currency || Paystack.currency !== currency)
    ) {
      Paystack.instance = new Paystack(currency);
      Paystack.currency = currency;
      return Paystack.instance;
    }

    return Paystack.instance;
  }
}
