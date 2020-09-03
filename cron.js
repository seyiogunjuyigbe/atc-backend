const moment = require('moment');
const {
  ProductCycle,
  Product,
  Transaction,
  PaymentSchedule,
  Installment,
} = require('./server/models');
const NotificationService = require('./server/services/notificationService');
const walletService = require('./server/services/walletService');
const stripeService = require('./server/services/stripeService');
const { createReference } = require('./server/services/paymentService');

module.exports = class Cron {
  async runAllCron() {
    console.log('Started Cron Jobs');
    setInterval(() => {
      Cron.productCron().catch(e => console.log(`Error running cron job ${e}`));
    }, 60000);
  }

  static async productCron() {
    const allProducts = await Product.find({
      isMainProduct: true,
      status: { $ne: 'canceled' },
    });

    for (let product = 0; product < allProducts.length; product += 1) {
      const data = allProducts[product];
      // TODO: @lawrence; change for loop to forEach
      // eslint-disable-next-line
      const cycle = await ProductCycle.findOne({
        product: data._id,
        _id: data.activeCycle,
      });
      if (!cycle) return;
      if (
        data.status === 'paused' &&
        moment(data.pauseDate).isSameOrAfter(new Date())
      ) {
        cycle.status = 'expired';
        cycle.endDate = new Date();
        data.status = 'expired';
        data.endDate = new Date();
        // eslint-disable-next-line
        await data.save();
        // eslint-disable-next-line
        await cycle.save();
        return;
      }
      const notice = { product: data, productCycle: cycle };
      const current = moment().startOf('day');
      const given = moment(data.endDate, 'YYYY-MM-DD');
      const waiting = moment(data.waitingCycle, 'YYYY-MM-DD');
      Cron.NotificationCron(
        notice,
        'soonExpired',
        moment.duration(current.diff(given)).asDays()
      );

      if (
        moment(moment().startOf('day')).isSame(data.endDate, 'day') ||
        cycle.availableSlots === cycle.slotsUsed
      ) {
        cycle.status = 'expired';
        data.status = 'expired';
        Cron.NotificationCron(notice, 'expired');
        // eslint-disable-next-line
        await cycle.save();
        // eslint-disable-next-line
        await data.save();
        return;
      }
      if (moment(new Date()).isAfter(data.endDate)) {
        cycle.status = 'expired';
        data.status = 'waiting';
        Cron.NotificationCron(notice, 'waiting');
        // eslint-disable-next-line
        await data.save();
        // eslint-disable-next-line
        await cycle.save();
      }
      if (moment.duration(current.diff(waiting)).asDays() === 2) {
        Cron.NotificationCron(notice, 'soonBeActive');
      }
      if (moment.duration(current.diff(given)).asDays() >= data.waitingCycle) {
        const endDate = moment(new Date(), 'DD-MM-YYYY').add(
          data.sellingCycle,
          'days'
        );
        Cron.NotificationCron(notice, 'active');
        data.status = 'active';
        data.endDate = endDate;
        data.startDate = new Date();
        // eslint-disable-next-line
        const currentCycle = await ProductCycle.create({
          product: data._id,
          startDate: new Date(),
          endDate,
          sellingCycle: data.sellingCycle,
          waitingCycle: data.waitingCycle,
          totalSlots: cycle.totalSlots,
        });
        data.activeCycle = currentCycle._id;
        // eslint-disable-next-line
        await data.save();
      }
    }
  }

  static NotificationCron(data, status, condition) {
    let newMessage;
    switch (status) {
      case 'active':
        newMessage = `${data.product.name} is currently on available for purchase`;
        break;
      case 'soonBeActive':
        newMessage = `${data.product.name} is will be available in two days for purchase`;
        break;
      case 'expired':
        newMessage = `${data.product.name} has expired`;
        break;
      case 'soonExpired':
        newMessage = `${data.product.name} will soon expire in two days`;
        break;
      case 'waiting':
        newMessage = `${data.product.name} is coming soon`;
        break;
      default:
        break;
    }
    new NotificationService()
      .sendNotificationList(data.product._id, newMessage, status, condition)
      .catch(error => console.log('Error With notification: ', error));
  }

  static async payoutCron() {
    const pendingPayouts = await Transaction.find({
      status: 'successful',
      type: 'payment',
      transactableType: 'Product',
      settleDate: moment.utc().startOf('day'),
    }).populate('vendor vendor.wallet');
    if (!pendingPayouts) console.log('No pending payouts');
    else {
      console.log('initializing payouts');
      if (pendingPayouts.length === 0) console.log('No pending payouts');
      else {
        pendingPayouts.forEach(async payoutTransaction => {
          const { vendor } = payoutTransaction;
          if (!vendor) console.log('No vendor found for this transaction');
          else {
            const payout = await walletService.creditWallet(
              vendor,
              payoutTransaction.amount
            );
            payoutTransaction.status = 'settled';
            await payoutTransaction.save();
            console.log({ message: `Payout done for ${vendor.email}`, payout });
          }
        });
      }
    }
  }

  static async chargeInstallments() {
    let amountPending;
    try {
      const installments = await Installment.find({
        nextChargeDate: moment.utc().startOf('day'),
        isCompleted: false,
      }).populate('user product');
      if (!installments || installments.length === 0)
        console.log('No payment installments for today');
      else {
        console.log('inititating installments');
        installments.forEach(async installment => {
          const {
            recurringAmount,
            amountCapturable,
            user,
            product,
          } = installment;
          if (maxNoOfInstallments - recurrentCount === 1) {
            amountPending = Math.max(recurrringAmount, (amountCapturable - totalPaid))
          }
          const installmentTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount: amountPending || recurringAmount,
            currency: 'usd',
            activeCycle: product.activeCycle,
            initiatedBy: user.id,
            customer: user,
            vendor: product.owner,
            transactableType: 'Product',
            transactable: product.id,
            description: `Installment payment for (${product.name})`,
            installment,
            meta: {
              createdAs: 'Installment payment transaction',
              createdBy: 'system',
            },
          });
          const intent = await stripeService.createOfflineIntent(
            installmentTransaction,
            user
          );
          // if failed, reschedule to tomorrow
          if (intent.status !== 'succeeded') {
            installment.failedAttempts += 1;
            installment.nextChargeDate = moment.utc().add(1, 'days');
            installment.transactions.push(installmentTransaction);
          }
          else {
            // set next oayment date
            installment.lastChargeDate = moment.utc();
            installment.nextChargeDate = moment
              .utc()
              .add(30, 'days')
              .startOf('day');
            installment.totalPaid += recurringAmount;
            installment.recurrentCount += 1;

            installmentTransaction.status = 'successful';
            installmentTransaction.paidAt = moment.utc();

            if (
              installment.recurrentCount === installment.maxNoOfInstallments
            ) {
              installment.isCompleted = true;
              // payout to vendor
              if (!product.vendor) {
                console.log('No vendor found for this transaction')
              }
              else {
                const payout = await walletService.creditWallet(
                  product.vendor,
                  installment.totalPaid
                );
              }
            }
            await installmentTransaction.save();
            await installment.save();
            console.log(
              `payment for installment (${user.email}) ${intent.status}`
            );
          }
        });
      }
    } catch (err) {
      console.log({ err });
    }
  }

  static async chargeSchedules() {
    try {
      const schedules = await PaymentSchedule.find({
        chargeDate: moment.utc().startOf('day'),
        isPaid: false,
      }).populate('user product');
      if (!schedules || schedules.length === 0)
        console.log('No payment schedules for today');
      else {
        console.log('initating schedules');
        schedules.forEach(async schedule => {
          const { amountCapturable, user, product } = schedule;
          const scheduleTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount: amountCapturable,
            currency: 'usd',
            activeCycle: product.activeCycle,
            initiatedBy: user.id,
            customer: user,
            vendor: product.owner,
            transactableType: 'Product',
            transactable: product.id,
            description: `Scheduled payment for (${product.name})`,
            schedule,
            meta: {
              createdAs: 'Scheduled payment transaction',
              createdBy: 'system',
            },
          });
          if (scheduleTransaction) console.log('payment transaction created');

          const intent = await stripeService.createOfflineIntent(
            scheduleTransaction,
            user
          );
          // if failed, reschedule to tomorrow
          if (intent.status !== 'succeeded') {
            schedule.failedAttempts += 1;
            schedule.chargeDate = moment.utc().add(1, 'days');
            schedule.transactions.push(scheduleTransaction);
          } else {
            schedule.isPaid = true;
            schedule.paidAt = moment.utc();
            scheduleTransaction.settleDate = moment
              .utc()
              .add(1, 'days')
              .startOf('day');
            scheduleTransaction.status = 'successful';
          }
          await schedule.save();
          await scheduleTransaction.save();
          console.log(`scheduled payment for (${user.email}) ${intent.status}`);
        });
      }
    } catch (err) {
      console.log({ err });
    }
  }
};
