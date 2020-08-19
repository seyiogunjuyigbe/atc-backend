const { ProductCycle, Product, Transaction } = require('./server/models')
const moment = require('moment');
const twService = require("./server/services/twservice");
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
    const allProducts = await Product.find({ isMainProduct: true, status: { $ne: "canceled" } });
    for (let product = 0; product < allProducts.length; product++) {
      const data = allProducts[product];
      const cycle = await ProductCycle.findOne({ product: data._id })
      if (!cycle) return;
      if (moment(moment().startOf('day')).isSame(data.endDate, 'day')) {
        cycle.status = "expired"
        data.status = "expired"
        await cycle.save()
        await data.save()
      }
      if (moment(new Date()).isAfter(data.waitingCycle)) {
        cycle.status = "expired"
        data.status = "waiting"
        await data.save();
        await cycle.save()
      }
      const current = moment().startOf('day');
      const given = moment(data.endDate, "YYYY-MM-DD");
      if (moment.duration(current.diff(given)).asDays() >= data.waitingCycle) {
        const endDate = moment(new Date(), "DD-MM-YYYY").add(data.sellingCycle, 'days')
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
  static async payoutCron() {
    let pendingPayouts = await Transaction.find({ status: "successful", type: 'payment', transactableType: "Product" }).populate('vendor vendor.wallet');
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
}
