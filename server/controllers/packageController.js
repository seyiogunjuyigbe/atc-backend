const {
    Package,
    Product
} = require('../models');
const {
    success,
    error
} = require("../middlewares/response");

module.exports = {
    async createPackage(req, res) {
        const {
            name,
            length

        } = req.body;
        try {
            let existingPack = await Package.findOne({
                name
            });
            if (existingPack) return error(res, 409, 'Duplicate name: Package "' + name + '" already exists');
            else {
                let newPackage = await Package.create({
                    name,
                    length,
                    createdBy: req.user.id,
                });
                if (newPackage) {
                    let package = await newPackage.save()
                    return success(res, 200, {
                        message: 'Package created successfully',
                        package
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
            length
        } = req.body;
        try {
            let thisPackage = await Package.findById(req.params.packageId);
            if (!thisPackage) return error(res, 404, 'Package not found')
            else if (thisPackage.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this')
            else {
                thisPackage.set({
                    name,
                    length
                });
                let updatedPackage = await thisPackage.save()
                return success(res, 200, {
                    message: 'Package updated successfully',
                    package: updatedPackage
                })
            }
        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async addProductToPackage(req, res) {
        const {
            productId
        } = req.body;
        const {
            packageId
        } = req.params;
        try {
            let product = await Product.findById(productId);
            let package = await Package.findById(packageId);
            if (!package) return error(res, 404, 'Package not found');
            if (!product) return error(res, 404, 'Product not found');
            package.products.push(product);
            package.save((err, package) => {
                if (err) return error(res, 400, err.message)
                else return success(res, 200, {
                    success: true,
                    package
                })
            })
        } catch (err) {
            return error(res, 400, err.message)
        }

    },
    async fetchAllPackages(req, res) {
        try {
            let packages = await Package.find({}).populate('products')
            if (!packages || packages.length == 0) return success(res, 204, 'No packages created yet');
            else return success(res, 200, packages)

        } catch (err) {
            return error(res, 500, err.message)
        }
    },
    async fetchPackage(req, res) {
        try {
            let package = await Package.findById(req.params.packageId).populate('products')
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
            else if (package.createdBy !== req.user.id) return error(res, 401, 'You are not authorized to do this');
            if (package.products.length > 0) {
                // delete all products in this package
                package.products.forEach(product => {
                    Product.findByIdAndDelete(product._id)
                        .then(done => {
                            console.log('Product deleted')
                        })
                        .catch(err => {
                            console.log(err.message)
                        })
                })
            }
            let package = await Package.findByIdAndDelete(req.params.packageId)
            if (!package) return success(res, 204, 'Package not found');
            else return success(res, 200, "Package deleted")
        } catch (err) {
            return error(res, 500, err.message)
        }
    }

}