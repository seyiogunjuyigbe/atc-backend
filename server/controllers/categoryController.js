const models = require('../models');
const {
    success,
    error
} = require("../middlewares/response");

module.exports = {
    async createCategory(req, res) {
        /* Create category
            method: POST
            body: 
        */
        const {
            name,
            parentId,
            description
        } = req.body;
        try {
            let existingCateg = await models.Category.findOne({
                where: {
                    name: name.toLowerCase()
                }
            })
            if (existingCateg) return error(res, 409, 'Category ( ' + name + ") already exists");
            else {
                let category = await models.Category.create({
                    name,
                    parentId,
                    description
                });
                return success(res, 200, {
                    success: true,
                    category
                })
            }
        } catch (err) {
            return error(res, 500, err.message)
        }

    },
    async updateCategory(req, res) {
        /*
        method: POST
        params: categoryId
        */
        try {
            let category = await models.Category.findByPk(req.params.categoryId);
            if (!category) return success(res, 204, 'Category not found');
            else {
                return success(res, 200, category)
            }
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllCategories(req, res) {
        /*
        method: GET
        */
        try {
            let categories = await models.Category.findAll();
            if (!categories || categories.length == 0) return success(res, 204, 'No categories found');
            else return success(res, 200, categories)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchThisCategory(req, res) {
        /*
        method: GET
        params: categoryId
        */
        try {
            let category = await models.Category.findByPk(req.params.categoryId);
            if (!category) return success(res, 204, 'Category not found');
            else return success(res, 200, category)
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deleteCategory(req, res) {
        /*
        method: GET
        params: categoryId
        */
        try {
            let category = await models.Category.destroy({
                where: {
                    id: req.params.categoryId
                }
            });
            if (!category) return success(res, 204, 'Category not found');
            else return success(res, 200, category)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }
}