const router = require("express").Router();
const { createContent,
    fetchContent,
    deleteContent,
    fetchAllContent,
} = require("../controllers/contentController");
const models = require('../models');
const authenticate = require('../middlewares/authentication')
const { check } = require('express-validator');
const { parser } = require('../middlewares/multer');
const getJWT = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/', authenticate, parser.single('content'), [
    check('contentFor').isIn(Object.keys(models)).withMessage('Specify model which content is for: ' + Object.keys(models).join(",")),
    check('contentForId').not().isEmpty().withMessage('ID required')
], validate, createContent)
router.get('/:contentId', fetchContent)
router.delete('/:contentId', authenticate, deleteContent)
router.get('/', fetchAllContent)


module.exports = router;