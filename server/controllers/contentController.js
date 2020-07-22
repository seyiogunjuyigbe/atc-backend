const models = require('../models');
const { multerUploads, dataUri }  = require ('../middlewares/multer');
const {uploader} = require('../config/cloudinary')
module.exports = {
    async createImageContent(req,res){
                if(req.file) {
                    console.log(req.file)
                const file = dataUri(req).content;
                return uploader.upload(file).then((result) => {
                    const image = result.url;
                    return res.status(200).json({
                    messge: 'Your image has been uploded successfully',
                    data: {
                         image,result
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
                     return res.status(422).json({error:true, message:"No file uploaded"})
                }

    },
    async createVideoContent(req,res){
        if(req.file) {
            console.log(req.file)
        const file = dataUri(req).content;
        return uploader.upload(file).then((result) => {
            const image = result.url;
            return res.status(200).json({
            messge: 'Your image has been uploded successfully',
            data: {
                 image,result
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
             return res.status(422).json({error:true, message:"No file uploaded"})
        }

}
}