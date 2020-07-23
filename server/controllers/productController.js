
const models = require('../models');
const _email = require("../services/emailService");
const responses = require("../helper/responses");
const { check, validationResult } = require('express-validator');



module.exports = {
    create: async (res,req) =>{
 
         const result = validationResult(req);
         const hasErrors = !result.isEmpty();
     
         if (hasErrors) {
           return res.status(400).send({ error: true,status_code: 400,message: result.array()});
         }


    try {
     
           const Product = await models.products.create(req.body);
                    if (Product) {
                    
                      return res.status(200).send(responses.success(200, "Your Product was successfully created.",Product));
                    } else {
                      return res
                        .status(400)
                        .send(responses.error(400, "Unable to create Product"));
                    }

        } catch (error) {
        return res
            .status(500)
            .send(
            responses.error(500, `Error creating a Product ${error.message}`)
            );
        }
    },
    viewProduct: async(res,req) => {
      try {
        const Product =  models.products.findByPk(req.params.id);
        if (!Product ) {
          return res.status(400).send(responses.error(400, "Product not found"));
        } else {
          return res
            .status(200)
            .send(
              responses.success(
                200,
                "Record was retreived successfully",
                Product
              )
            );
        }
      } catch (error) {
        return res
          .status(500)
          .send(responses.error(500, `Error viewing a product ${error.message}`));
      }

    },
    listProduct: (res,req) => {
       
      var offset = (req.query.offset) ? req.query.offset : 0;
      var limit = (req.query.limit) ? req.query.limit : 20;
      var orderBy = (req.query.orderBy) ? req.query.orderBy : 'id';
      var order = (req.query.order) ? req.query.order : 'ASC';
      var ordering = [
          [orderBy, order],
      ];
  
   
      
      models.products.findAndCountAll({
          offset: parseInt(offset), 
          limit: parseInt(limit),
          order: ordering,
         
      }).then(function(product){
        
          return res.status(200).send(responses.success(200,"Record was retreived successfully",product));
      })



    

    },
    updateProduct:async (res,req) => {
     
      try {
        const result = await models.products.update(
          req.body,
          { where: { _id: req.params.id} }
        );
      
        return res
          .status(200)
          .send(responses.success(200, "Product was updated successfully", result));
      } catch (err) {
        return res
        .status(500)
        .send(responses.error(500, `Error updating an record ${err.message}`));
      }
    }


};