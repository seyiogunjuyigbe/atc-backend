const { config, uploader } = require('cloudinary').v2;
const {cloud_name,api_key,api_secret} = require('./local')
const cloudinaryConfig = () => config({
cloud_name,
api_key,
api_secret,
});
// cloudinaryConfig()
module.exports = {cloudinaryConfig, uploader };
