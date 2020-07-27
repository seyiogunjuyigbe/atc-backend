const router = require("express").Router();
const {
    createPackage,
    updatePackage,
    fetchAllPackages,
    fetchPackage,
    deletePackage
} = require("../controllers/packageController");
const {
    check
} = require('express-validator');
const authenticate = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/', authenticate, [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('description').not().isEmpty().withMessage('Package description required'),
    check('createdBy').not().isEmpty().withMessage('Owner Id required'),
    check('features').isArray({
        min: 1
    }).withMessage('features array required'),
    check('price').not().isEmpty().withMessage('Package price required')
], validate, createPackage);
router.put('/:packageId', authenticate, [
    check('name').not().isEmpty().withMessage('Package name required'),
    check('description').not().isEmpty().withMessage('Package description required'),
    check('features').isArray({
        min: 1
    }).withMessage('features array required'),
    check('userId').not().isEmpty().withMessage('User ID required'),
    check('price').not().isEmpty().withMessage('Package price required')
], validate, updatePackage);
router.get('/', fetchAllPackages)
router.get('/:packageId', fetchPackage)
router.delete('/:packaageId', authenticate, deletePackage)

module.exports = router;