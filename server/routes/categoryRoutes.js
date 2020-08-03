const router = require("express").Router();
const {
    createCategory,
    deleteCategory,
    fetchAllCategories,
    fetchThisCategory,
    updateCategory
} = require("../controllers/categoryController");
const {
    check
} = require('express-validator');
const authenticate = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/', authenticate, [
    check('name').not().isEmpty().withMessage('Category name required'),
    check('description').not().isEmpty().withMessage('Category description required'),
    check('type').isIn(['adventure', 'top-sight']).withMessage('Valid types: adventure, top-sight')
], validate, createCategory);
router.put('/:categoryId', authenticate, [
    check('name').not().isEmpty().withMessage('Category name required'),
    check('description').not().isEmpty().withMessage('Category description required'),
    check('type').isIn(['adventure', 'top-sight']).withMessage('Valid types: adventure, top-sight')

], validate, updateCategory);
router.get('/:categoryId', fetchThisCategory);
router.get('/', fetchAllCategories);
router.delete('/:categoryId', authenticate, deleteCategory);

module.exports = router;