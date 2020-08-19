const { ProductCycle, Product, Transaction } = require('./server/models')
const moment = require('moment');
const twService = require("./server/services/twservice");
const walletService = require("./server/services/walletService")
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
    let pendingPayouts = await Transaction.find({ status: "successful", type: 'payment', transactableType: "Product" }).populate('vendor vendor.wallet');
    if (!pendingPayouts) console.log("No pending payouts");
    else {
      pendingPayouts = pendingPayouts.filter(pay => {
        return moment(pay.settleDate).isSameOrBefore(moment().startOf('day'))
      });
      if (pendingPayouts.length == 0) console.log("No pending payouts")
      else {
        pendingPayouts.forEach(async transaction => {
          let { vendor } = transaction;
          if (!vendor) console.log("No vendor found for this transaction");
          else {
            let payout = await walletService.creditWallet(vendor, transaction.amount);
            console.log({ message: "Payout done for " + vendor.email, payout })
          }
          // else if (!vendor.bankAccount) console.log("Payout failed for " + vendor.email + ": Bank acount details found")
          // else {
          //   let quote = await twService.createQuote(vendor.bankAccount, amount);
          //   if (quote.error || typeof (quote) == "string") console.log("Error creating quote" + vendor.email + ": " + quote.error || quote)
          //   else {
          //     let payoutTransaction = await Transaction.create({
          //       type: 'payout',
          //       reference: createReference('payout'),
          //       provider: 'transferwise',
          //       paymentType: "bankAccount",
          //       amount,
          //       vendor: vendor,
          //       bankAccount: vendor.bankAccount,
          //       description: "Payout from ATC",
          //     })
          //     let transfer = await twService.initateTransfer(vendor.bankAccount.transferWiseId, quote.id, transaction.reference);
          //     if (transfer.error && typeof (transfer) == "string") {
          //       console.log("Error initiating transfer for " + vendor.email + ": " + transfer.error || transfer)
          //     }
          //     else {
          //       transaction.transferwiseId = transfer.id;
          //       let payout = await twService.completeTransfer(transfer.id);
          //       if (payout.status !== "COMPLETED") transaction.status = "failed";
          //       else transaction.status = "successful";
          //       console.log("Payout successful for " + vendor.email + ": " + payout);
          //       transaction.status = "settled"
          //       await transaction.save()

          //     }
          //   }
          // }
        })
      }

    }

  }
}