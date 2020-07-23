const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");
const subRoute = require("./subscriptionRoute");
const membershipRoute =  require('./membershipRoute');
const productRoute = require('./productRoute');
const contentRoutes = require('./contentRoute')

indexRoute.use("/", authRoute);
indexRoute.use("/",membershipRoute);
indexRoute.use("/",subRoute);
indexRoute.use("/",productRoute);
indexRoute.use('/content', contentRoutes)


module.exports = indexRoute;