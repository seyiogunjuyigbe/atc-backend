module.exports = {
    checkFileType(req,res,next){
        if(req.files.length == 0){
            return res.status(422).json({error:true,message:'no files uploaded'})
        }
        else{
            var wrongFile = req.files.find(file=>{
                return (file.mimetype.indexOf('image') == -1 && file.mimetype.indexOf('video') == -1)
            });
            if(wrongFile) return res.status(422).json({error:true,message:'Wrong file format uploaded',wrongFile})
            else  next()
        }
        next()
    }
}