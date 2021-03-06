const models = require('../models');
const {
    Op
} = require("sequelize");
module.exports = {
    async createContent(req, res) {
        /* 
        method: POST
        body: contentFor,contentForId
        */
        const {
            contentFor,
            contentForId
        } = req.body;
        try {
            if (req.file) {
                var url = req.file.path;
                let {
                    mimetype
                } = req.file;
                var type = mimetype.substring(0, mimetype.indexOf('/'));
                if (type == "image" && mimetype.substring(mimetype.indexOf('/') + 1, mimetype.length) == "gif") type = "gif"
                let newContent = await models.Content.create({
                    forType: contentFor,
                    forId: contentForId,
                    url,
                    type
                });
                if (!newContent) return res.status(400).json({
                    error: true,
                    message: 'Error creating content'
                })
                else return res.status(200).json({
                    success: true,
                    message: 'Content created successfully',
                    content: newContent
                })
            } else {
                return res.status(422).json({
                    error: true,
                    message: "No file uploaded"
                })
            }
        } catch (err) {
            return res.status(500).json({
                error: true,
                message: err.message
            })
        }

    },
    async fetchContent(req, res) {
        /*
        method:GET
        params: contentId
        */
        try {
            let content = await models.Content.findByPk(req.params.contentId);
            if (!content) return res.status(404).json({
                error: true,
                message: 'Content not found'
            })
            else return res.status(200).json({
                success: true,
                content
            })
        } catch (err) {
            return res.status(500).json({
                error: true,
                message: err.message
            })
        }
    },
    async deleteContent(req, res) {
        /*
        method:GET
        params: contentId
        */
        try {
            let content = await models.Content.destroy({
                where: {
                    id: req.params.contentId
                }
            });
            if (!content) return res.status(404).json({
                error: true,
                message: 'Content not found'
            })
            else return res.status(200).json({
                success: true,
                message: "Content deleted successfully"
            })
        } catch (err) {
            return res.status(500).json({
                error: true,
                message: err.message
            })
        }
    },
    async fetchAllContent(req, res) {
        /*
method:GET
params(query): type,forType,forId (optional)
*/
        const {
            type,
            forType,
            forId
        } = req.query
        try {
            var whereStatement = {};
            if (type) whereStatement.type = type;
            if (forType) whereStatement.forType = forType;
            if (forId) whereStatement.forId = forId;
            let content = await models.Content.findAll({
                where: whereStatement
            });
            if (!content || content.length == 0) return res.status(204).json({
                success: true,
                message: 'No content found'
            })
            else return res.status(200).json({
                success: true,
                content
            })
        } catch (err) {
            return res.status(500).json({
                error: true,
                message: err.message
            })
        }
    },

}