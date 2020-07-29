const {
    Package,
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
            features,
            price
        } = req.body;
        try {
            let existingPack = await Package.findOne({
                name
            });
            if (existingPack) return error(res, 409, 'Duplicate name: Package "' + name + '" already exists');
            else {
                let newPackage = await Package.create({
                    name,
                    description,
                    createdBy: req.user.id,
                    features,
                    price
                });
                if (newPackage) {
                    newPackage.save((err, package) => {
                        if (err) return error(res, 400, err.message)
                        else {
                            return success(res, 200, {
                                message: 'Package created successfully',
                                package: newPackage
                            })
                        }
                    })
                }
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
            let thisPackage = await Package.findById(req.params.packageId);
            if (!thisPackage) return error(res, 404, 'Package not found')
            else if (thisPackage.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            else {
                thisPackage.set({
                    name,
                    description,
                    features,
                    price
                });
                thisPackage.save((err, package) => {
                    if (err) return error(res, 400, err.message);
                    else {
                        return success(res, 200, {
                            message: 'Package updated successfully',
                        })
                    }
                })

            }
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchAllPackages(req, res) {
        try {
            let packages = await Package.find({})
            if (!packages || packages.length == 0) return success(res, 204, 'No packages created yet');
            else return success(res, 200, packages)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchPackage(req, res) {
        try {
            let package = await Package.findById(req.params.packageId)
            if (!package) return success(res, 204, 'Package not found');
            else return success(res, 200, package)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async deletePackage(req, res) {
        try {
            let thisPackage = await Package.findById(req.params.packageId);
            if (!thisPackage) return error(res, 404, 'Package not found')
            else if (package.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            let package = await Package.findByIdAndDelete(req.params.packageId)
            if (!package) return success(res, 204, 'Package not found');
            else return success(res, 200, "Package deleted")

        } catch (err) {
            return error(res, 500, err.message)
        }
    }

}