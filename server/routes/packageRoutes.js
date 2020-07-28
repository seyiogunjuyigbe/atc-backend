const router = require("express").Router();
const {
    createPackage,
    updatePackage,
    fetchAllPackages,
    fetchPackage,
    deletePackage,
    addProductToPackage
} = require("../controllers/packageController");
const {
    check
} = require('express-validator');
const authenticate = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/', authenticate, [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('length_value').not().isEmpty().withMessage('Package length required'),
    check('frequency').not().isEmpty().withMessage('Package frequency required'),

], validate, createPackage);
router.put('/:packageId', authenticate, [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('length_value').not().isEmpty().withMessage('Package length required'),
    check('frequency').not().isEmpty().withMessage('Package frequency required'),
], validate, updatePackage);
router.put('/:packageId/add', authenticate, [
    check('productId').not().isEmpty().withMessage('Product ID required'),
], validate, addProductToPackage);
router.get('/', fetchAllPackages)
router.get('/:packageId', fetchPackage)
router.delete('/:packaageId', authenticate, deletePackage)

module.exports = router;