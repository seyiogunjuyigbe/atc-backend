const Product = require('./server/models/product')
const moment = require('moment');
module.exports = class Cron {

   async productCron() {
       console.log('Started Cron for Product')
        const allProducts = await Product.find({});
        for (let product = 0; product < allProducts.length; product++) {
            const data = allProducts[product];
            if(moment(new Date()).isSame(data.endDate, 'day')) {
                data.statues = "expired"
                await product.save()
            }
            if(moment(new Date()).isAfter(data.endDate)) {
                data.statues = "wating"
                await product.save();
            }
            const current = moment().startOf('day');
            const given = moment(data.endDate, "YYYY-MM-DD");
            if(moment.duration(given.diff(current)).asDays()>= data.cycleNumber) {
                data.statues = "active"
                data.endDate = moment( new Date() , "DD-MM-YYYY" ).add( data.cycleNumber , 'days' )
                data.startDate = new Date();
                await product.save()
            }
        }
    } 
}