const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { cloudinaryConfig } = require('../config/cloudinary');

cloudinaryConfig();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'content',
  },
});

const multiStorage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: 'activities',

    // allowed_formats: ['png', 'jpg', 'gif', 'mp4', '3gp', 'avi', 'webm', 'mpeg', 'flv']
  },
});
const parser = multer({
  storage,
});
const multiParser = multer({
  storage: multiStorage,
});
module.exports = {
  parser,
  multiParser,
};
