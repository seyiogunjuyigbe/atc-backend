const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");
const contentRoutes = require('./contentRoute')


indexRoute.use("/", authRoute);
indexRoute.use('/content', contentRoutes)


module.exports = indexRoute;
