const express = require("express");
const indexRoute = express.Router();
const authRoute = require("./authRoute");



indexRoute.use("/", authRoute);


module.exports = indexRoute;
