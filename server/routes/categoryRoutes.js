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

router.post('/new', [
    check('name').not().isEmpty().withMessage('Category name not required'),
    check('description').not().isEmpty().withMessage('Category name not required')
], validate, createCategory);
router.post('/update/:categoryId', [
    check('name').not().isEmpty().withMessage('Category name not required'),
    check('description').not().isEmpty().withMessage('Category name not required')
], validate, updateCategory);
router.get('/fetch/:categoryId', fetchThisCategory);
router.get('/fetch-all', fetchAllCategories);
router.get('/delete/:categoryId', deleteCategory);

module.exports = router;