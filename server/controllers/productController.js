const {
  Product ,
  Package
} = require( '../models' );
const _email = require( '../services/emailService' );
const responses = require( '../helper/responses' );
const {
  check ,
  validationResult
} = require( 'express-validator' );

module.exports = {
  create : async ( res , req ) => {
    const result = validationResult( req );
    const hasErrors = !result.isEmpty();
    if ( hasErrors ) {
      return res
        .status( 400 )
        .send( {
          error : true ,
          status_code : 400 ,
          message : result.array()
        } );
    }

    try {
      const packages = await Package.findById( { name : req.body.packageTitle } )
      if ( packages ) {
        return res
          .status( 400 )
          .send( responses.error( 400 , 'Package already exist' ) );
      }
      const createdPackage = await Package.create( { name : req.body.packageTitle , length : req.body.length } )
      const productList = req.body.products
      for ( let i = 0 ; i < productList.length ; i++ ) {
        productList.push({packageID: createdPackage._id})
      }
      const product = await Product.insertMany( productList );
      if ( product ) {
        product.save( ( err , product ) => {
          if ( err ) {
            return res
              .status( 400 )
              .send( responses.error( 400 , err.message ) );
          } else {
            return res
              .status( 200 )
              .send(
                responses.success(
                  200 ,
                  'Your Product was successfully created.' ,
                  product ,
                ) ,
              );
          }
        } )

      } else {
        return res
          .status( 400 )
          .send( responses.error( 400 , 'Unable to create Product' ) );
      }
    } catch ( error ) {
      return res
        .status( 500 )
        .send(
          responses.error( 500 , `Error creating a Product ${ error.message }` ) ,
        );
    }
  } ,
  viewProduct : async ( res , req ) => {
    try {
      const product = await Product.findById( req.params.productId );
      if ( !product ) {
        return res.status( 400 ).send( responses.error( 400 , 'Product not found' ) );
      } else {
        return res
          .status( 200 )
          .send(
            responses.success(
              200 ,
              'Record was retreived successfully' ,
              product ,
            ) ,
          );
      }
    } catch ( error ) {
      return res
        .status( 500 )
        .send( responses.error( 500 , `Error viewing a product ${ error.message }` ) );
    }
  } ,
  listProduct : ( res , req ) => {
    var offset = req.query.offset ? req.query.offset : 0;
    var limit = req.query.limit ? req.query.limit : 20;
    var orderBy = req.query.orderBy ? req.query.orderBy : 'id';
    var order = req.query.order ? req.query.order : 'ASC';
    var ordering = [
      [ orderBy , order ]
    ];

    Product
      .find( {} )
      .limit( limit )
      .skip( offset )
      .sort( {
        ordering
      } )
      .then( function ( product ) {
        Product.countDocuments().exec( ( err , products ) => {
          return res
            .status( 200 )
            .send(
              responses.success(
                200 ,
                'Record was retreived successfully' ,
                products ,
              ) ,
            );
        } );
      } )
  } ,
  updateProduct : async ( res , req ) => {
    try {
      const result = await Product.findByIdAndUpdate( req.params.productId , req.body );
      result.save()
      return res
        .status( 200 )
        .send(
          responses.success( 200 , 'Product was updated successfully' , result ) ,
        );
    } catch ( err ) {
      return res
        .status( 500 )
        .send( responses.error( 500 , `Error updating an record ${ err.message }` ) );
    }
  } ,
  deleteProduct : async ( res , req ) => {
    try {
      const product = await Product.findByIdAndDelete( req.params.productId );
      if ( !product )
        return res
          .status( 400 )
          .send(
            responses.error( 400 , 'product not found' ) );

      else

        return res
          .status( 200 )
          .send(
            responses.success( 200 , 'Product was deleted successfully' , product )
          );

    } catch ( err ) {
      return error( res , 500 , err.message )
    }
  }
};
