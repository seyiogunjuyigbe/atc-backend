const multer = require ('multer');
const Datauri = require ('datauri/parser');
const path = require ('path');
const storage = multer.memoryStorage();
const multerImageUploads = multer({ storage }).array('image', 10);
const multerVideoUploads = multer({ storage }).array('video', 10);
const dUri = new Datauri();
const dataUri =req => dUri.format(
path.extname(req.file.originalname).toString(),
req.file.buffer
).content;
// req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
module.exports = { multerImageUploads, dataUri };

