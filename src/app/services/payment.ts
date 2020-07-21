import * as config from '../../../config';
import { Paystack } from './paystack';
import { Flutterwave } from './flutterwave';

const DEFAULT_PROVIDER = config.get('featureFlags.defaultProvider');

export class Payment {
  public AUTO_WITHDRAW_LIMIT = 10000;

  public constructor(currency = 'NGN') {
    if (currency === 'USD') {
      this.AUTO_WITHDRAW_LIMIT = 1000;
    }
  }

  public static createReference(type) {
    const randomChars = Math.random().toString(32).substr(8);
    let prefix = '';
    switch (type) {
      case 'payment':
        prefix = 'AFW_PAY';
        break;
      case 'payout':
        prefix = 'AFW_PYT';
        break;
      case 'reversal':
        prefix = 'AFW_REV';
        break;
      default:
        break;
    }
    return `${prefix}_${randomChars}_${Date.now()}`.toUpperCase();
  }

  public static getInstance(currency, provider = DEFAULT_PROVIDER) {
    if (provider === 'flutterwave') {
      return Flutterwave.getInstance(currency);
    }

    return Paystack.getInstance(currency);
  }
}
