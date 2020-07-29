const express = require("express");
const productCrl = require("../controllers/productController");
const productRoute = express.Router();



productRoute.post("/", productCrl.create);


productRoute.get("/", productCrl.listProduct);
productRoute.put("/:productId", productCrl.updateProduct);
productRoute.get("/:productId", productCrl.viewProduct);
//productRoute.delete("/product/:productId",  productCrl.deleteProduct);
productRoute.post("/:productId/purchase", productCrl.purchaseProduct);




module.exports = productRoute;
