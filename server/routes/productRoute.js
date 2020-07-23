const express = require("express");
const productCrl = require("../controllers/productController");
const productRoute = express.Router();



productRoute.post("/product/create",  productCrl.create);


productRoute.get("/product/list",  productCrl.listProduct);
productRoute.put("/product/update/:id",  productCrl.updateProduct);
productRoute.get("/product/one/:id",  productCrl.viewProduct);




module.exports = productRoute;
