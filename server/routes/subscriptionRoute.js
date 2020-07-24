const express = require("express");
const subCrl = require("../controllers/subscriptionController");
const subRoute = express.Router();



subRoute.post("/sub/create", subCrl.create);


subRoute.get("/sub/list", subCrl.listSubscription);
subRoute.put("/sub/:id",subCrl.updateSubscription);
subRoute.get("/sub/:id", subCrl.viewSubscription);




module.exports = subRoute;