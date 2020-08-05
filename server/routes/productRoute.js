const express = require("express");
const productCrl = require("../controllers/productController");
const productRoute = express.Router();
const {
    check
} = require('express-validator');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authentication')
const { checkIfAdmin } = require('../middlewares/access')

productRoute.post("/", authenticate, productCrl.create);


productRoute.get("/", productCrl.listProduct);
productRoute.put("/:productId", authenticate, productCrl.updateProduct);
productRoute.get("/:productId", productCrl.viewProduct);
productRoute.get('/priority', productCrl.fetchHomePageProducts)
productRoute.put('/:productId/priority', authenticate, check('priority').not().isEmpty().withMessage('Priority is required'),
    validate, checkIfAdmin, productCrl.updateProductPriority)

//productRoute.delete("/product/:productId",  productCrl.deleteProduct);
productRoute.post("/:productId/purchase", authenticate, productCrl.purchaseProduct);




module.exports = productRoute;
