const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bankAccountSchema = new Schema({
    accountHolderName: {
        type: String,
        required: true
    },
    legalType: {
        type: String,
        enum: ["PRIVATE", "BUSINESS"],
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        enum: ["AED", "ARS", "AUD", "BDT", "BGN", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EGP", "EUR", "GBP",
            "GEL", "GHS", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY", "KES", "KRW", "LKR", "MAD", "MXN", "MYR", "NGN",
            "NOK", "NPR", "NZD", "PEN", "PHP", "PKR", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "UAH", "USD", "VND", "ZAR"]
    },
    ownedByCustomer: {
        type: Boolean,
        default: false
    },
    businessNumber: String,
    address: {
        country: String,
        countryCode: String,
        firstLine: String,
        postCode: String,
        city: String,
        state: String
    },
    accountType: String,
    sortCode: String,
    bankCode: String,
    phoneNumber: String,
    dateOfBirth: String,
    rut: String,
    swiftCode: String,
    branchCode: String,
    cpf: String,
    ifscCode: String,
    idDocumentType: String,
    idDocumentNumber: String,
    nationality: String,
    job: String,
    russiaRegion: String,
    IBAN: String,
    taxId: String,
    institutionNumber: String,
    transitNumber: String,
    bban: String,
    clabe: String,
    BIC: String,
    bsbCode: String,
    clearingNumber: String,
    abartn: String,
    prefix: String,
    interacAccount: String,
    token: String,
    bankgiroNumber: String,
    expiryMonth: String,
    expiryYear: String,
    cardToken: String,
    cardNumber: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    transferWiseId: String,
})
module.exports = mongoose.model('BankAccount', bankAccountSchema)
