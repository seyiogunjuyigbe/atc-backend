const { Content } = require('../models');
const models = require('../models');

module.exports = {
  async createContent(req, res) {
    /* 
        method: POST
        body: contentFor,contentForId
        */
    const { contentFor, contentForId } = req.body;
    try {
      if (req.file) {
        const url = req.file.path;
        const { mimetype } = req.file;
        let type = mimetype.substring(0, mimetype.indexOf('/'));
        if (
          type === 'image' &&
          mimetype.substring(mimetype.indexOf('/') + 1, mimetype.length) ===
            'gif'
        )
          type = 'gif';
        const newContent = await Content.create({
          forType: contentFor,
          contentFor: contentForId,
          url,
          type,
        });
        if (contentForId) {
          const doc = await models[contentFor].findById(contentForId);
          doc.contents.addToSet(newContent.id);
          await doc.save();
          if (!newContent)
            return res.status(400).json({
              error: true,
              message: 'Error creating content',
            });
        } else {
          newContent.save((err, content) => {
            return res.status(200).json({
              success: true,
              message: 'Content created successfully',
              content,
            });
          });
        }
      } else {
        return res.status(422).json({
          error: true,
          message: 'No file uploaded',
        });
      }
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  },
  async fetchContent(req, res) {
    /*
        method:GET
        params: contentId
        */
    try {
      const content = await Content.findById(req.params.contentId);
      if (!content)
        return res.status(404).json({
          error: true,
          message: 'Content not found',
        });
      return res.status(200).json({
        success: true,
        content,
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  },
  async deleteContent(req, res) {
    /*
        method:GET
        params: contentId
        */
    try {
      const content = await Content.findById(req.params.contentId);
      if (!content)
        return res.status(404).json({
          error: true,
          message: 'Content not found',
        });
      const doc = await models[content.forType].findById(content.contentFor);
      doc.contents.pull(content.id);
      await doc.save();
      await content.remove();
      return res.status(200).json({
        success: true,
        message: 'Content deleted successfully',
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  },
  async fetchAllContent(req, res) {
    /*
method:GET
params(query): type,forType,contentFor (optional)
*/
    const { type, forType, contentFor } = req.query;
    try {
      const whereStatement = {};
      if (type) whereStatement.type = type;
      if (forType) whereStatement.forType = forType;
      if (contentFor) whereStatement.contentFor = contentFor;
      const content = await Content.find({
        $or: [
          {
            whereStatement,
          },
        ],
      });
      if (!content || content.length === 0)
        return res.status(204).json({
          success: true,
          message: 'No content found',
        });
      return res.status(200).json({
        success: true,
        content,
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  },
};
