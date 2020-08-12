const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bankAccountSchema = new Schema({
    fullName: {
        type: String, required: true
    },
    legalType: {
        type: String,
        enum: ["private", "business"],
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    isOwnedByCustomer: Boolean,

})
module.exports = mongoose.model('BankAccount', bankAccountSchema)