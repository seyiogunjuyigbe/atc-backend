const { Category, Content } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async createCategory(req, res) {
    /* Create category
            method: POST
            body: 
        */
    const { name, parentId, description, type, occurrence } = req.body;
    try {
      const existingCateg = await Category.findOne({
        name: name.toLowerCase(),
      });
      if (existingCateg)
        return error(res, 409, `Category ( ${name}) already exists`);

      const category = await Category.create({
        name,
        parentId,
        description,
        type,
        occurrence,
      });
      let contents = [];
      if (req.files && req.files.length) {
        contents = await Promise.all(
          req.files.map(async file => {
            return Content.create({
              url: file.path,
              forType: 'category',
              contentFor: category.id,
              type: file.mimetype.substring(0, file.mimetype.indexOf('/')),
            });
          })
        );
        await category.set({ contents });
        await category.save();
      }
      return success(res, 200, { success: true, category });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async updateCategory(req, res) {
    /*
        method: POST
        params: categoryId
        */
    try {
      const category = await Category.findByIdAndUpdate(req.params.categoryId, {
        ...req.body,
      });
      let contents = [];
      if (req.files.length > 0) {
        contents = req.files.map(file => {
          return Content.create({
            url: file.path,
            forType: 'Category',
            contentFor: category.id,
            type: file.mimetype.substring(0, file.mimetype.indexOf('/')),
          });
        });
        category.set({ contents });
      }
      await category.save();
      return success(res, 200, category);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchAllCategories(req, res) {
    /*
        method: GET
        */
    try {
      const categories = await Category.find({});
      if (!categories || categories.length === 0)
        return success(res, 204, 'No categories found');
      return success(res, 200, categories);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchThisCategory(req, res) {
    /*
        method: GET
        params: categoryId
        */
    try {
      const category = await Category.findById(req.params.categoryId);
      if (!category) return success(res, 404, 'Category not found');
      return success(res, 200, category);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async deleteCategory(req, res) {
    /*
        method: DELETE
        params: categoryId
        */
    try {
      const category = await Category.findByIdAndRemove(req.params.categoryId);
      if (!category) return success(res, 204, 'Category not found');
      return success(res, 200, category);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
