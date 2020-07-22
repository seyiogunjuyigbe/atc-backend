const router = require("express").Router();;
const {} = require("../controllers/contentController");
const {check} = require('express-validator');
const multerUploads = require('../middlewares/multer');
const validate = require('../middlewares/validate')
router.post('/new', multerUploads, [
    check()
], validate,)
module.exports = router;