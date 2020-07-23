const models = require('../models');
const {uploader} = require('../config/cloudinary')
module.exports = {
    async createImageContent(req,res){
        const {contentFor,contentForId,url} = req.body;
        try {
                  if(req.files.length > 0) {
                  let newContent = await models.contents.create({forType:contentFor,forId:contentForId,url});
                  if(!newContent) return res.status(400).json({error:true,message:'Error creating content'})
                  else return res.status(200).json({success:true,message:'Content created successfully'})
                }
                else{
                     return res.status(422).json({error:true, message:"No file uploaded"})
                }          
        } catch (err) {
            return res.status(500).json({error:true, message:err.message})
        }

    },

}