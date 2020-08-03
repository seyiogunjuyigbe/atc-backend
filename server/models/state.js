const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
    name: { type: String, uppercase: true },
    countryId: Schema.Types.ObjectId,

})

module.exports = mongoose.model('State', stateSchema)