const { Package, Product } = require('../models');
const { success, error } = require('../middlewares/response');

module.exports = {
  async createPackage(req, res) {
    const { name, length } = req.body;
    try {
      const existingPack = await Package.findOne({
        name,
      });
      if (existingPack)
        return error(
          res,
          409,
          `Duplicate name: Package "${name}" already exists`
        );

      const newPackage = await Package.create({
        name,
        length,
        createdBy: req.user.id,
      });
      if (newPackage) {
        const savedPackage = await newPackage.save();
        return success(res, 200, {
          message: 'Package created successfully',
          package: savedPackage,
        });
      }
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async updatePackage(req, res) {
    const { name, length } = req.body;
    try {
      const thisPackage = await Package.findById(req.params.packageId);
      if (!thisPackage) return error(res, 404, 'Package not found');
      if (thisPackage.createdBy !== req.user.id)
        return error(res, 401, 'You are not authorized to do this');

      thisPackage.set({
        name,
        length,
      });
      const updatedPackage = await thisPackage.save();
      return success(res, 200, {
        message: 'Package updated successfully',
        package: updatedPackage,
      });
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async addProductToPackage(req, res) {
    const { productId } = req.body;
    const { packageId } = req.params;
    try {
      const product = await Product.findById(productId);
      const foundPackage = await Package.findById(packageId);
      if (!foundPackage) return error(res, 404, 'Package not found');
      if (!product) return error(res, 404, 'Product not found');
      foundPackage.products.push(product);
      foundPackage.save((err, savedPackage) => {
        if (err) return error(res, 400, err.message);
        return success(res, 200, {
          success: true,
          package: savedPackage,
        });
      });
    } catch (err) {
      return error(res, 400, err.message);
    }
  },
  async fetchAllPackages(req, res) {
    try {
      const packages = await Package.find({}).populate('products');
      if (!packages || packages.length === 0)
        return success(res, 204, 'No packages created yet');
      return success(res, 200, packages);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async fetchPackage(req, res) {
    try {
      const foundPackage = await Package.findById(
        req.params.packageId
      ).populate('products');
      if (!foundPackage) return success(res, 204, 'Package not found');
      return success(res, 200, foundPackage);
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
  async deletePackage(req, res) {
    try {
      const thisPackage = await Package.findById(req.params.packageId);
      if (!thisPackage) return error(res, 404, 'Package not found');
      if (thisPackage.createdBy !== req.user.id)
        return error(res, 401, 'You are not authorized to do this');
      if (thisPackage.products.length > 0) {
        // delete all products in this thisPackage
        thisPackage.products.forEach(product => {
          Product.findByIdAndDelete(product._id)
            .then(done => {
              console.log('Product deleted: ', done);
            })
            .catch(err => {
              console.log(err.message);
            });
        });
      }
      const deletedPackage = await Package.findByIdAndDelete(
        req.params.packageId
      );
      if (!deletedPackage) return success(res, 204, 'Package not found');
      return success(res, 200, 'Package deleted');
    } catch (err) {
      return error(res, 500, err.message);
    }
  },
};
