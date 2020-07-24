const stripe = require("stripe")("sk_test_4ed24rkbnvcb3987dd23rc");

(async () => {
    const charge = await stripe.charges.create({
      amount: 999,
      currency: 'usd',
      source: 'tok_visa',
      receipt_email: 'jenny.rosen@example.com',
    });
  })();