const { ProductCycle, Product, Transaction, PaymentSchedule, Installment } = require('./server/models')
const moment = require('moment');
const twService = require("./server/services/twservice");
const NotificationService = require("./server/services/notificationService");
const walletService = require("./server/services/walletService");
const stripeService = require('./server/services/stripeService');
const { createReference } = require('./server/services/paymentService');
module.exports = class Cron {
  async runAllCron() {
    console.log('Started Cron Jobs')
    await Cron.productCron().catch((e) => console.log(`Error running cron job ${e}`))
    setInterval(() => {
      Cron.productCron().catch((e) => console.log(`Error running cron job ${e}`))
    }, 60000);
  }

  static async productCron() {
    const allProducts = await Product.find({ isMainProduct: true, status: { $ne: "canceled" } });
    for (let product = 0; product < allProducts.length; product++) {
      const data = allProducts[product];
      const cycle = await ProductCycle.findOne({ product: data._id })
      if (!cycle) return;
      const notice = { product: data, productCycle: cycle }
      const current = moment().startOf('day');
      const given = moment(data.endDate, "YYYY-MM-DD");
      const waiting = moment(data.waitingCycle, "YYYY-MM-DD");
      Cron.NotificationCron(notice, "soonExpired", moment.duration(current.diff(given)).asDays())

      if (moment(moment().startOf('day')).isSame(data.endDate, 'day') || cycle.availableSlots === cycle.slotsUsed) {
        cycle.status = "expired"
        data.status = "expired"
        Cron.NotificationCron(notice, "expired")
        await cycle.save()
        await data.save()
        return;
      }
      if (moment(new Date()).isAfter(data.endDate)) {
        cycle.status = "expired"
        data.status = "waiting"
        Cron.NotificationCron(notice, "waiting")
        await data.save();
        await cycle.save()
      }
      if (moment.duration(current.diff(waiting)).asDays() === 2) {
        Cron.NotificationCron(notice, "soonBeActive")
      }
      if (moment.duration(current.diff(given)).asDays() >= data.waitingCycle) {
        const endDate = moment(new Date(), "DD-MM-YYYY").add(data.sellingCycle, 'days')
        Cron.NotificationCron(notice, "active")
        data.status = "active"
        data.endDate = endDate
        data.startDate = new Date();
        const currentCycle = await ProductCycle.create({
          product: data._id,
          startDate: new Date(),
          endDate,
          sellingCycle: data.sellingCycle,
          waitingCycle: data.waitingCycle,
          totalSlots: cycle.totalSlots,
        })
        data.activeCycle = currentCycle._id
        await data.save()
      }
    }
  }

  static NotificationCron(data, status, condition) {
    let newMessage
    switch (status) {
      case "active":
        newMessage = `${data.product.name} is currently on available for purchase`
        break
      case "soonBeActive":
        newMessage = `${data.product.name} is will be available in two days for purchase`
        break
      case "expired":
        newMessage = `${data.product.name} has expired`
        break
      case "soonExpired":
        newMessage = `${data.product.name} will soon expire in two days`
        break
      case "waiting":
        newMessage = `${data.product.name} is coming soon`
        break
    }
    new NotificationService().sendNotificationList(data.product._id, newMessage, status, condition).catch((error) => console.log('Error With notification: ', error))
  }

  static async payoutCron() {
    let pendingPayouts = await Transaction.find({
      status: "successful",
      type: 'payment',
      transactableType: "Product"
    }).populate('vendor vendor.wallet');
    if (!pendingPayouts) console.log("No pending payouts");
    else {
      pendingPayouts = pendingPayouts.filter(pay => {
        return moment(pay.settleDate).isSameOrBefore(moment().startOf('day'))
      });
      if (pendingPayouts.length == 0) console.log("No pending payouts")
      else {
        pendingPayouts.forEach(async payoutTransaction => {
          let { vendor } = payoutTransaction;
          if (!vendor) console.log("No vendor found for this transaction");
          else {
            let payout = await walletService.creditWallet(vendor, payoutTransaction.amount);
            payoutTransaction.status = "settled"
            await payoutTransaction.save()
            console.log({ message: "Payout done for " + vendor.email, payout })
          }

        })
      }

    }

  }
  static async chargeInstallments() {
    try {
      let installments = await
        Installment
          .find({ nextChargeDate: moment.utc().startOf('day'), isCompleted: false })
          .populate('user product')
      if (!installments || installments.length == 0) console.log("No payment installments for today");
      else {
        console.log("inititating installments")
        installments.forEach(async installment => {
          let { recurringAmount, amountCapturable, user, product } = installment
          let installmentTransaction = await Transaction.create({
            reference: createReference('payment'),
            amount: recurringAmount,
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
              createdAs: "Installment payment transaction",
              createdBy: "system"
            }
          })
          let intent = await stripeService.createOfflineIntent(installmentTransaction, user);
          // if failed, reschedule to tomorrow
          if (intent.status == "requires_payment_method") {
            installment.failedAttempts++;
            installment.nextChargeDate = moment.utc().add(1, 'days');
            installment.transactions.push(installmentTransaction)
          } else {
            // set next oayment date
            installment.set({
              lastChargeDate: moment.utc(),
              nextChargeDate: moment.utc().add(30, 'days').startOf('day'),
              recurringAmount: recurringAmount + recurringAmount,
              recurrentCount: recurrentCount++,
            });
            if (installment.recurrentCount == installment.maxNoOfInstallments) {
              installment.isCompleted = true;
              // create a transaction that has amount set to the total installment amounts and set up for vendor payout
              let completeTransaction = await Transaction.create({
                reference: createReference('payment'),
                amount: amountCapturable,
                currency: 'usd',
                activeCycle: product.activeCycle,
                initiatedBy: user.id,
                customer: user,
                vendor: product.owner,
                transactableType: 'Product',
                transactable: product.id,
                description: `Complete installment payment for (${product.name})`,
                installment,
                settleDate: moment.utc().add(product.cancellationDaysLimit, 'days').startOf('day'),
                meta: {
                  createdAs: "Complete installment payment record",
                  createdBy: "system"
                }
              })
            }
          }
          await installment.save()
          console.log(`payment for installment (${user.email}) ${intent.status}`)
        })
      }
    } catch (err) {
      console.log({ err })
    }
  }
  static async chargeSchedules() {
    try {
      let schedules = await
        PaymentSchedule
          .find({ chargeDate: moment.utc().startOf('day'), isPaid: false })
          .populate('user product')
      if (!schedules || schedules.length == 0) console.log("No payment schedules for today");
      else {
        console.log("initating schedules")
        schedules.forEach(async schedule => {
          let { amountCapturable, user, product } = schedule
          let scheduleTransaction = await Transaction.create({
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
              createdAs: "Scheduled payment transaction",
              createdBy: "system"
            }
          })
          if (scheduleTransaction) console.log("payment transaction created")

          let intent = await stripeService.createOfflineIntent(scheduleTransaction, user);
          // if failed, reschedule to tomorrow
          if (intent.status == "requires_payment_method") {
            schedule.failedAttempts++;
            schedule.chargeDate = moment.utc().add(1, 'days');
            schedule.transactions.push(scheduleTransaction)
          } else {
            schedule.isPaid = true;
            // create a transaction that has amount set to the total schedule amount and set up for vendor payout
            let completeTransaction = await Transaction.create({
              reference: createReference('payment'),
              amount: schedule.amountCapturable,
              currency: 'usd',
              activeCycle: product.activeCycle,
              initiatedBy: user.id,
              customer: user,
              vendor: product.owner,
              transactableType: 'Product',
              transactable: product.id,
              description: `Successful schedule payment for (${product.name})`,
              schedule,
              settleDate: moment.utc().add(product.cancellationDaysLimit, 'days').startOf('day'),
              meta: {
                createdAs: "Successful schedule payment record",
                createdBy: "system"
              }
            })
          }
        })
      }
    } catch (err) {
      console.log({ err })
    }
  }
}
