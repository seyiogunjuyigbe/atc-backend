const router = require("express").Router();;
const {createContent} = require("../controllers/contentController");
const {check} = require('express-validator');
const {multerUploads} = require('../middlewares/multer');
const getJWT = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/new', multerUploads,createContent)
module.exports = router;