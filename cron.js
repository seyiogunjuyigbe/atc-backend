const Product = require('./server/models/product')
const ProductCycle = require('./server/models/productCycle')
const moment = require('moment');
module.exports = class Cron {

  async productCron() {
    console.log('Started Cron for Product')
    const allProducts = await Product.find({isMainProduct: true});
    for (let product = 0; product < allProducts.length; product++) {
      const data = allProducts[product];
      if(moment(new Date()).isSame(data.endDate, 'day')) {
        data.statues = "expired"
        await data.save()
      }
      if(moment(new Date()).isAfter(data.endDate)) {
        data.statues = "waiting"
        await data.save();
      }
      if(moment(data.endDate).isAfter( moment(data.endDate, "DD-MM-YYYY" ).add( data.cycleNumber , 'days' ))) {
        data.statues = "active"
        data.endDate = moment( new Date() , "DD-MM-YYYY" ).add( data.cycleNumber , 'days' )
        data.startDate = new Date();
        await data.save()
      }
    }
  }
}