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
const parser = require('../middlewares/multer');
const getJWT = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/', [
    check('name').not().isEmpty().withMessage('Category name required'),
    check('description').not().isEmpty().withMessage('Category description required')
], validate, createCategory);
router.put('/:categoryId', [
    check('name').not().isEmpty().withMessage('Category name required'),
    check('description').not().isEmpty().withMessage('Category description required')
], validate, updateCategory);
router.get('/:categoryId', fetchThisCategory);
router.get('/', fetchAllCategories);
router.delete('/:categoryId', deleteCategory);

module.exports = router;