import * as m from 'moment';
import * as ip from 'ip';
import * as md5 from 'md5';
import * as forge from 'node-forge';
import * as createError from 'http-errors';
import * as config from '../../../config';
import endpointsUtil from '../../shared/util/endpoints';
import http from '../services/http';

export class Flutterwave {
  private endpoints;
  private static instance = null;
  private static currency = null;
  public AUTO_WITHDRAW_LIMIT = 10000;
  public config: any = {};

  public constructor(currency = 'NGN') {
    this.endpoints = endpointsUtil();

    this.config = {
      publicKey: config.get('api.flutterwave.publicKey'),
      secretKey: config.get('api.flutterwave.secretKey'),
      baseUrl: config.get('api.flutterwave.baseUrl'),
    };

    if (currency === 'USD') {
      this.AUTO_WITHDRAW_LIMIT = 1000;
    }
  }

  public initiate(options) {
    const {
      user,
      transaction,
      transactable,
      paymentType,
    } = options;
    const { amount, reference, currency } = transaction;

    if (paymentType === 'newCard') {
      return {
        paymentType,
        reference,
        amount,
        key: this.config.publicKey,
        provider: 'flutterwave',
      };
    }

    let encrypted = null;

    if (transactable && paymentType === 'account') {
      const p = {
        amount,
        currency,
        payment_type: paymentType,
        accountnumber: transactable.number,
        accountbank: transactable.bank.code,
        bvn: user.bvn,
        country: 'NG',
        email: user.email,
        firstname: user.firstName,
        IP: ip.address(),
        lastname: user.lastName,
        passcode: user.dob && m(user.dob, 'YYYY-MM-DD').format('DDMMYYYY'),
        PBFPubKey: this.config.publicKey,
        phonenumber: user.phone,
        txRef: reference,
      };

      const key = this.getKey(this.config.secretKey);
      encrypted = this.encrypt(key, JSON.stringify(p));

      return {
        url: this.endpoints.raveInitiatePayment,
        key: this.config.publicKey,
        provider: 'flutterwave',
        client: encrypted,
        alg: '3DES-24',
      };
    }
  }

  public async chargeSavedCard({ transaction, transactable, user }) {
    const { cardType, token } = transactable;
    const { firstName, lastName, email } = user;
    const { reference, amount } = transaction;

    const currency = cardType?.toUpperCase();

    const payload = {
      currency,
      token,
      email,
      amount,
      country: 'NGN',
      firstname: firstName,
      lastname: lastName,
      SECKEY: this.config.secretKey,
      IP: ip.address(),
      txRef: reference,
    };

    return await http.post(this.endpoints.raveTokenCharge, payload);
  }

  public async validate(options) {
    const payload = {
      PBFPubKey: this.config.publicKey,
      transaction_reference: options.reference,
      otp: options.otp,
    };

    return await http.post(this.endpoints.raveValidatePayment, payload);
  }

  public async verify(options) {
    const payload = {
      tx_ref: options.paymentRef,
      SECKEY: this.config.secretKey,
    };

    return await http.post(this.endpoints.raveVerifyPayment, payload);
  }

  public async withdraw(options) {
    const { amountNgn, reference, bankAccount, currency } = options;

    if (currency.toLowerCase() === 'usd' || bankAccount.isIn('us')) {
      // @TODO
      // Run stripe stuff here
      throw createError(
        422,
        'US withdrawal processessing has not been implemented yet.',
      );
      // return await http.post(this.endpoints.raveCreateTransfer, {});
    }

    const payload = {
      reference,
      currency,
      amount: amountNgn,
      account_bank: bankAccount.bank.code,
      account_number: bankAccount.number,
      seckey: this.config.secretKey,
      narration: 'Withdrawal Request',
    };

    return await http.post(this.endpoints.raveCreateTransfer, payload);
  }

  public async getTransfer(options) {
    const params = {
      reference: options.reference,
      seckey: this.config.secretKey,
    };

    return await http.get(this.endpoints.raveGetTransfer, params);
  }

  public async verifyAccount(options) {
    const url = this.endpoints.verifyAccount;
    const params = {
      recipientaccount: options.bankAccount,
      destbankcode: options.bankCode,
      PBFPubKey: this.config.publicKey,
    };
    const response = await http.post(url, params);

    if (response && response.data) {
      const status = response.data.status;
      const responseCode = response.data.data.responsecode;

      return status === 'success' && responseCode === '00';
    }

    return false;
  }

  public isSuccessful({ data: { status } }) {
    return status === 'successful';
  }

  private getKey(seckey) {
    const keymd5 = md5(seckey);
    const keymd5last12 = keymd5.substr(-12);

    const seckeyadjusted = seckey.replace('FLWSECK-', '');
    const seckeyadjustedfirst12 = seckeyadjusted.substr(0, 12);

    return seckeyadjustedfirst12 + keymd5last12;
  }

  private encrypt(key, text) {
    const cipher = forge.cipher.createCipher(
      '3DES-ECB',
      forge.util.createBuffer(key),
    );
    cipher.start({ iv: '' });
    cipher.update(forge.util.createBuffer(text, 'utf-8', 'hex'));
    cipher.finish();

    const encrypted = cipher.output;
    return forge.util.encode64(encrypted.getBytes());
  }

  public static getInstance(currency) {
    if (
      !Flutterwave.instance &&
      (!Flutterwave.currency || Flutterwave.currency !== currency)
    ) {
      Flutterwave.instance = new Flutterwave(currency);
      Flutterwave.currency = currency;
      return Flutterwave.instance;
    }

    return Flutterwave.instance;
  }
}
