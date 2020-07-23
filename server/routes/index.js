const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");
const membershipRoute = require("./membershipRoute");


indexRoute.use("/", authRoute);


module.exports = indexRoute;
