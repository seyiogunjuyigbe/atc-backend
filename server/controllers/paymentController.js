const {
    STRIPE_SECRET_KEY, WEBHOOK_SECRET
} = process.env
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const {
    success,
    error
} = require("../middlewares/response");
module.exports = {

    async webhook(req, res) {
        const sig = req.headers['stripe-signature'];
        try {
            let event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);

            let intent;
            if (event['type'] === 'payment_intent.succeeded') {
                intent = event.data.object;
                return success(res, 200, { success: true, intent: intent.id });
            } else if (event['type'] === 'payment_intent.payment_failed') {
                intent = event.data.object;
                const message = intent.last_payment_error && intent.last_payment_error.message;
                return error({ success: false, intent: intent.id, message });
            }

        } catch (err) {
            return error(res, 400, 'Invalid signature')
        }

    }
}

