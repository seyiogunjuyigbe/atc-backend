const {
    Category
} = require('../models');
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
            description,
            type,
            occurrence,
        } = req.body;
        try {
            let existingCateg = await Category.findOne({ name: name.toLowerCase() })
            if (existingCateg) return error(res, 409, 'Category ( ' + name + ") already exists");
            else {
                let contents = []
                if (req.files.length > 0) {
                    contents = req.files.map(file => {
                        return file.path
                    })
                }
                console.log(contents)
                let category = await Category.create({
                    name,
                    parentId,
                    description,
                    type,
                    occurrence,
                    contents
                });
                await category.save();
                return success(res, 200, { success: true, category })
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
            let category = await Category.findByIdAndUpdate(req.params.categoryId, {
                ...req.body
            });
            if (!category) return success(res, 204, 'Category not found');
            else {
                category.save()
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
            let categories = await Category.find({});
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
            let category = await Category.findById(req.params.categoryId);
            if (!category) return success(res, 404, 'Category not found');
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
            let category = await Category.findByIdAndRemove(req.params.categoryId);
            if (!category) return success(res, 204, 'Category not found');
            else return success(res, 200, category)
        } catch (err) {
            return error(res, 500, err.message)
        }
    }
}
