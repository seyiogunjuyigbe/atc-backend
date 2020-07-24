const express = require("express");
const productCrl = require("../controllers/productController");
const productRoute = express.Router();



productRoute.post("/product/create",  productCrl.create);


productRoute.get("/product/list",  productCrl.listProduct);
productRoute.put("/product/:productId",  productCrl.updateProduct);
productRoute.get("/product/:productId",  productCrl.viewProduct);
//productRoute.delete("/product/:productId",  productCrl.deleteProduct);




module.exports = productRoute;
