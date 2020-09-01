const {ProductCycle, Product, Transaction} = require('./server/models')
const moment = require('moment');
const twService = require("./server/services/twservice");
const NotificationService = require("./server/services/notificationService");
const walletService = require("./server/services/walletService")
module.exports = class Cron {
  async runAllCron() {
    console.log('Started Cron Jobs')
    await Cron.productCron().catch((e) => console.log(`Error running cron job ${e}`))
    setInterval(() => {
      Cron.productCron().catch((e) => console.log(`Error running cron job ${e}`))
    }, 60000);
  }

  static async productCron() {
    const allProducts = await Product.find({isMainProduct: true, status: {$ne: "canceled"}});
    for (let product = 0; product < allProducts.length; product++) {
      const data = allProducts[product];
      const cycle = await ProductCycle.findOne({product: data._id, _id: data.activeCycle})
      if (!cycle) return;
      if (data.status==="paused" && moment(data.pauseDate).isSameOrAfter(new Date())) {
        cycle.status = "expired"
        cycle.endDate = new Date()
        data.status = "expired"
        data.endDate = new Date()
        await data.save()
        await cycle.save()
        return;
      }
      const notice = {product: data, productCycle: cycle}
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
      case "active" :
        newMessage = `${data.product.name} is currently on available for purchase`
        break
      case "soonBeActive" :
        newMessage = `${data.product.name} is will be available in two days for purchase`
        break
      case "expired" :
        newMessage = `${data.product.name} has expired`
        break
      case "soonExpired" :
        newMessage = `${data.product.name} will soon expire in two days`
        break
      case "waiting" :
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
          let {vendor} = payoutTransaction;
          if (!vendor) console.log("No vendor found for this transaction");
          else {
            let payout = await walletService.creditWallet(vendor, payoutTransaction.amount);
            payoutTransaction.status = "settled"
            await payoutTransaction.save()
            console.log({message: "Payout done for " + vendor.email, payout})
          }

        })
      }

    }

  }
}
