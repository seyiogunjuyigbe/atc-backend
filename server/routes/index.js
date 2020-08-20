const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");
const subRoute = require("./subscriptionRoute");
const membershipRoute = require('./membershipRoute');
const productRoute = require('./productRoute');
const contentRoutes = require('./contentRoute');
const activityRoute = require('./activityRoute');
const packageRoutes = require('./packageRoutes')
const categoryRoutes = require('./categoryRoutes');
const stateRoutes = require('./stateRoutes')
const paymentRoute = require('./paymentRoute')
const memberReviewRoute = require('./memberReviewRoute');
const bankRoutes = require("./bankRoute")
indexRoute.use("/auth", authRoute);
indexRoute.use("/memberships", membershipRoute);
indexRoute.use("/members_review", memberReviewRoute);
indexRoute.use("/subscriptions", subRoute);
indexRoute.use("/products", productRoute);
indexRoute.use('/packages', packageRoutes)
indexRoute.use('/contents', contentRoutes);
indexRoute.use('/categories', categoryRoutes)
indexRoute.use('/activities', activityRoute);
indexRoute.use('', stateRoutes)
indexRoute.use('/payments', paymentRoute);
indexRoute.use("", bankRoutes);
module.exports = indexRoute;