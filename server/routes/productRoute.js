const express = require("express");
const productCrl = require("../controllers/productController");
const productRoute = express.Router();

const authenticate = require('../middlewares/authentication')



productRoute.post("/", authenticate, productCrl.create);


productRoute.get("/", productCrl.listProduct);
productRoute.put("/:productId", authenticate, productCrl.updateProduct);
productRoute.get("/:productId", productCrl.viewProduct);
//productRoute.delete("/product/:productId",  productCrl.deleteProduct);
productRoute.post("/:productId/purchase", authenticate, productCrl.purchaseProduct);




module.exports = productRoute;
