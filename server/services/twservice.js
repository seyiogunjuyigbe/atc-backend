const { TRANSFERWISE_API_KEY, TRANSFERWISE_PROFILE_ID, TW_MODE } = process.env;
const Transferwise = require('transferwise');

const TwClient = new Transferwise({
  apiKey: TRANSFERWISE_API_KEY,
  sandbox: TW_MODE === 'sandbox',
});
const uuid = require('uuid');

module.exports = {
  async createRecipient(bankaccount) {
    const { currency, type, sort_code, accountHolderName } = bankaccount;
    try {
      const recipient = await TwClient.createRecipientAccount({
        currency,
        type,
        sort_code,
        profile: TRANSFERWISE_PROFILE_ID,
        ownedByCustomer: false,
        accountHolderName,
        details: bankaccount,
      });
      return recipient;
    } catch (err) {
      return err;
    }
  },
  async deleteRecipientAccount(accountId) {
    try {
      const recipient = await TwClient.deleteRecipientAccount({ accountId });
      return recipient;
    } catch (err) {
      return err;
    }
  },
  async createQuote(bankAccount, amount) {
    try {
      const quote = await TwClient.createQuote({
        data: {
          profile: TRANSFERWISE_PROFILE_ID,
          source: 'USD',
          target: bankAccount.currency,
          sourceAmount: amount,
          rateType: 'FIXED',
          type: 'BALANCE_PAYOUT',
        },
      });
      return quote;
    } catch (err) {
      return err.message;
    }
  },
  async initateTransfer(targetAccount, quote, ref) {
    try {
      const transfer = await TwClient.createTransfer({
        customerTransactionId: uuid(),
        details: {
          reference: ref.replace(/_/g, '').substring(0, 12),
          sourceOfFunds: 'Earnings from ATC',
          transferPurpose: 'Payout',
        },
        quote,
        targetAccount,
      });
      return transfer;
    } catch (err) {
      console.log({ err });
      return err.message;
    }
  },
  async completeTransfer(transferId) {
    try {
      const payout = await TwClient.fundTransfer({
        transferId,
        type: 'BALANCE',
      });
      console.log(payout);
      return payout;
    } catch (err) {
      return err.message;
    }
  },
};
