'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recommendationSchema = new Schema({
    featureType: {
        type: String,
        enum: ['Product', 'Activity'],
        required: true,
    },
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'type',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: String
})
module.exports = mongoose.model('Recommendation', recommendationSchema)