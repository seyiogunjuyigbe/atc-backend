// const { config, uploader } = require('cloudinary').v2;
// const {cloud_name,api_key,api_secret} = require('./local')
// const cloudinaryConfig = () => config({
// cloud_name,
// api_key,
// api_secret,
// });
// cloudinaryConfig()
// module.exports = { uploader };
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'some-folder-name',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => 'computed-filename-using-request',
  },
});
 
const parser = multer({ storage: storage });
module.exports = parser;
