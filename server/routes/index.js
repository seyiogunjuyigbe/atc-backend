const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");
const subRoute = require("./subscriptionRoute");
const membershipRoute = require('./membershipRoute');
const productRoute = require('./productRoute');
const contentRoutes = require('./contentRoute')
const categoryRoutes = require('./categoryRoutes')

indexRoute.use("/auth", authRoute);
indexRoute.use("/memeberships", membershipRoute);
indexRoute.use("/subscriptions", subRoute);
indexRoute.use("/products", productRoute);
indexRoute.use('/contents', contentRoutes);
indexRoute.use('/categories', categoryRoutes)


module.exports = indexRoute;