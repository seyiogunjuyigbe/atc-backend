const express = require("express");
const indexRoute = express.Router();
const companyRoute = require("./authRoute");
const shipperRoute = require("./shipperRoute");
const truckRoute = require("./truckRoute");
const transporterRoute = require("./transporterRouter");
const orderRoute = require("./orderRouter");
const formRoute = require("./formRouter");
const settingRoute = require("./settingRoute");
const dashboardRoute = require("./dashboardRouter");
const shipperSettingRoute = require("./shipperSettingRouter");
const shipperDashboardRoute = require("./shipperDashboardRouter");
const trackerRoute = require("./trackerRouter");

indexRoute.use("/", companyRoute);
indexRoute.use("/", shipperRoute);
indexRoute.use("/", truckRoute);
indexRoute.use("/", formRoute);
indexRoute.use("/", orderRoute);
indexRoute.use("/", transporterRoute);
indexRoute.use("/", dashboardRoute);
indexRoute.use("/", shipperSettingRoute);
indexRoute.use("/", shipperDashboardRoute);
indexRoute.use("/", settingRoute);
indexRoute.use("/", trackerRoute);

module.exports = indexRoute;
