const { ProductCycle, Product, Transaction } = require('./server/models')
const moment = require('moment');
const twService = require("./server/services/twservice")
module.exports = class Cron {
  runAllCron() {
    console.log('Started Cron Jobs')
    setInterval(() => {
      Cron.productCron().catch((e) => console.log(`Error running cron job ${e}`))
    }, 60000);
  }

  static async productCron() {
    const allProducts = await Product.find({ isMainProduct: true, status: { $ne: "canceled" } });
    for (let product = 0; product < allProducts.length; product++) {
      const data = allProducts[product];
      const cycle = await ProductCycle.findOne({ product: data._id })
      if (moment(moment().startOf('day')).isSame(data.endDate, 'day')) {
        cycle.status = "expired"
        data.status = "expired"
        await cycle.save()
        await data.save()
      }
      if (moment(new Date()).isAfter(data.waitingCycle) && data.status === "expired") {
        cycle.status = "waiting"
        data.status = "waiting"
        await data.save();
      }
      const current = moment().startOf('day');
      const given = moment(data.endDate, "YYYY-MM-DD");
      if (moment.duration(given.diff(current)).asDays() >= data.waitingCycle) {
        const endDate = moment(new Date(), "DD-MM-YYYY").add(data.sellingCycle, 'days')
        data.status = "active"
        data.endDate = endDate
        data.startDate = new Date();
        const currentCycle = await ProductCycle.create({
          product: data._id,
          startDate: new Date(),
          endDate,
          sellingCycle: data.sellingCycle,
          waitingCycle: data.waitingCycle
        })
        data.activeCycle = currentCycle._id
        await data.save()
      }
    }
  }
  static async payoutCron() {
    const pendingPayouts = await Transaction.find({ status: "successful", type: 'payment', transactableType: "Product" }).populate('vendor vendor.bankAccount');
    if (!pendingPayouts) console.log("No pending payouts");
    else {
      let current = pendingPayouts.filter(pay => {
        return moment(pay.settleDate).isSameOrBefore(moment().startOf('day'))
      });
      if (current.length == 0) console.log("No current pending payouts")
      current.forEach(async transaction => {
        let { vendor } = transaction;
        if (!vendor) console.log("No vendor found for this transaction")
        else if (!vendor.bankAccount) console.log("Payout failed for " + vendor.email + ": Bank acount details found")
        else {
          let quote = await twService.createQuote(vendor.bankAccount, amount);
          if (quote.error || typeof (quote) == "string") console.log("Error creating quote" + vendor.email + ": " + quote.error || quote)
          else {
            let transaction = await Transaction.create({
              type: 'payout',
              reference: createReference('payout'),
              provider: 'transferwise',
              paymentType: "transferwise",
              amount,
              vendor: vendor,
              bankAcount: vendor.bankAccount,
              description: "Payout from ATC",
            })
            let transfer = await twService.initateTransfer(vendor.bankAccount.transferWiseId, quote.id, transaction.reference);
            if (transfer.error && typeof (transfer) == "string") {
              console.log("Error initiating transfer for " + vendor.email + ": " + transfer.error || transfer)
            }
            else {
              transaction.transferwiseId = transfer.id;
              let payout = await twService.completeTransfer(transfer.id);
              if (payout.status !== "COMPLETED") transaction.status = "failed";
              else transaction.status = "successful";
              await transaction.save()
              console.log("PAyout successful for " + vendor.email + ": " + payout);
              current.status = "settled"
            }
          }
        }
      })
    }

  }
}