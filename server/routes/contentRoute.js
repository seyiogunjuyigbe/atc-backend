const router = require("express").Router();
const {
    createContent,
    fetchContent,
    deleteContent,
    fetchAllContent,
    fetchAllGifs,
    fetchAllImages,
    fetchAllVideos,
    fetchContentForThisType
} = require("../controllers/contentController");
const {
    check
} = require('express-validator');
const parser = require('../middlewares/multer');
const getJWT = require('../middlewares/authentication')
const validate = require('../middlewares/validate');

router.post('/new', parser.single('content'), [
    check('contentFor').not().isEmpty().withMessage('Specify content purpose (product,program etc)'),
    check('contentForId').not().isEmpty().withMessage('ID required')
], validate, createContent)
router.get('/fetch/:contentId', fetchContent)
router.get('/delete/:contentId', deleteContent)
router.get('/fetch-all/video', fetchAllVideos)
router.get('/fetch-all/image', fetchAllImages)
router.get('/fetch-all/gif', fetchAllGifs)
router.get('/fetch-all', fetchAllContent)


module.exports = router;