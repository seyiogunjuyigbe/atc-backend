const router = require("express").Router();;
const {createImageContent,createVideoContent} = require("../controllers/contentController");
const {check} = require('express-validator');
const {multerImageUploads} = require('../middlewares/multer');
const getJWT = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/image/new', multerImageUploads,createImageContent)
router.post('/video/new', multerImageUploads,createVideoContent)

module.exports = router;