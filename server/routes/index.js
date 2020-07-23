const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");
const subRoute = require("./subscriptionRoute");
const membershipRoute =  require('./membershipRoute');
const productRoute = require('./productRoute');

indexRoute.use("/", authRoute);
indexRoute.use("/",membershipRoute);
indexRoute.use("/",subRoute);
indexRoute.use("/",productRoute);


module.exports = indexRoute;
