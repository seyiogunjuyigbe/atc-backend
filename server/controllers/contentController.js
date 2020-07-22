const models = require('../models');
const {error,success,output} = require("../helper/responses");
const { multerUploads, dataUri }  = require ('../middlewares/multer');
const {uploader} = require('../config/cloudinary')
module.exports = {
    async createContent(req,res){
        console.log('got here')
                if(req.file) {
                    console.log('found file')

                const file = dataUri(req).content;
                return uploader.upload(file).then((result) => {
                    const image = result.url;
                    return res.status(200).json({
                    messge: 'Your image has been uploded successfully',
                    data: {
                         image
                        }
                    })
                })
                .catch((err) => res.status(400).json({
                     messge: 'someting went wrong while processing your request',
                     data: {
                        err
                     }
                    }))
                }
                else{
                    console.log('no file')
                     return res.status(422).json({error:true, message:"No file uploaded"})
                }

    }
}