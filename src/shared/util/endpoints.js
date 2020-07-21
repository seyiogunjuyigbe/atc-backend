const config = require('../../../config');

export default () => {
  const paystackBaseUrl = config.get('api.paystack.baseUrl');

  return {
    validateBvn: `${paystackBaseUrl}/bank/resolve_bvn`,
    verifyAccount: `${paystackBaseUrl}/bank/resolve`,
    verifyPayment: `${paystackBaseUrl}/transaction/verify`,
    tokenCharge: `${paystackBaseUrl}/transaction/charge_authorization`,
    initiatePayment: `${paystackBaseUrl}/transaction/initialize`,
    createRecipient: `${paystackBaseUrl}/transferrecipient`,
    createTransfer: `${paystackBaseUrl}/transfer`,
    finalizeTransfer: `${paystackBaseUrl}/transfer/finalize_transfer`,
    getTransfer: `${paystackBaseUrl}/transfer`,
    firebaseApi: 'https://fcm.googleapis.com/fcm',
  };
};
