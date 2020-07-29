require('dotenv').config();
const stripe = require("stripe")(process.env.Stripe_key);

(async () => {
  const charge = await stripe.charges.create({
    amount: 999,
    currency: 'usd',
    source: 'tok_visa',
    receipt_email: 'jenny.rosen@example.com',
  });
})();
// charge card
// refund