const express = require('express');
const subCrl = require('../controllers/subscriptionController');

const subRoute = express.Router();

subRoute.post('/', subCrl.create);

subRoute.get('/', subCrl.listSubscription);
subRoute.put('/:subId', subCrl.updateSubscription);
subRoute.get('/:subId', subCrl.viewSubscription);

module.exports = subRoute;
