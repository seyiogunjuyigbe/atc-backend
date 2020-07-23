const cloudinary = require('cloudinary').v2;
const {
  CloudinaryStorage
} = require('multer-storage-cloudinary');
const multer = require('multer');
const {
  cloudinaryConfig
} = require('../config/cloudinary');
cloudinaryConfig()

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'content',
    public_id: (req, file) => {
      return file.originalname
    },
  },
});

const parser = multer({
  storage: storage
});
module.exports = parser;