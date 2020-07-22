const models = require('../models');
const {error,success,output} = require("../helper/responses");
const { multerUploads, dataUri }  = require ('../middlewares/multer');
const {uploader} = require('../config/cloudinary')
module.exports = {
    async createContent(req,res){
        try {
            if(req.file) {
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
        const newUpload = await models.contents.create({...req.body});
        if(newUpload) return success(200,'Content created successfully')
        } catch (err) {
           return error(500,err.message)
        }
    }
}