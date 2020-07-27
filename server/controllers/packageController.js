const {
    Package,
    users
} = require('../models');
const {
    success,
    error
} = require("../middlewares/response");

module.exports = {
    async createPackage(req, res) {
        const {
            name,
            description,
            createdBy,
            features,
            price
        } = req.body;
        try {
            let existingPack = await Package.findOne({
                where: {
                    name
                }
            });
            let thisUser = await users.findByPk(createdBy);
            if (existingPack) return error(res, 409, 'Duplicate name: Package "' + name + '" already exists');
            if (!thisUser) return error(res, 400, 'Invalid user selected')
            else {
                let newPackage = await Package.create({
                    name,
                    description,
                    createdBy: thisUser.id,
                    features,
                    price
                });
                if (newPackage) return success(res, 200, {
                    message: 'Package created successfully',
                    package: newPackage
                })
            }
        } catch (err) {
            return error(res, 500, err.message)
        }

    },
    async updatePackage(req, res) {
        const {
            name,
            description,
            features,
            price
        } = req.body;
        try {

            let updatedPackage = await Package.update({
                name,
                description,
                features,
                price
            }, {
                where: {
                    id: req.params.packageId
                }
            });
            if (!updatedPackage) return error(res, 404, 'Package not found')
            if (updatedPackage) return success(res, 200, {
                message: 'Package updated successfully',
            })

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllPackages(req, res) {
        try {
            let packages = await Package.findAll()
            if (!packages || packages.length == 0) return success(res, 204, 'No packages created yet');
            else return success(res, 200, packages)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchPackage(req, res) {
        try {
            let package = await Package.findByPk(req.params.packageId)
            if (!package) return success(res, 204, 'Package not found');
            else return success(res, 200, package)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deletePackage(req, res) {
        try {
            let package = await Package.destroy({
                where: {
                    id: req.params.packageId
                }
            })
            if (!package) return success(res, 204, 'Package not found');
            else return success(res, 200, "Package deleted")

        } catch (err) {
            return error(res, 500, err.message)
        }
    }

}