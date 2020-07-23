const router = require("express").Router();;
const {createImageContent,createVideoContent} = require("../controllers/contentController");
const {check} = require('express-validator');
const parser = require('../middlewares/multer');
const getJWT = require('../middlewares/authentication')
const validate = require('../middlewares/validate');
const {checkFileType} = require('../middlewares/file')

router.post('/new',[
    check('').not().isEmpty().withMessage(''),
    check('').not().isEmpty().withMessage('')
],validate,parser.array('content', 10), createImageContent)

module.exports = router;