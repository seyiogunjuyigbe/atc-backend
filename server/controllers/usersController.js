
const models = require('../models');
const _email = require("../services/emailService");
const responses = require("../helper/responses");
const { check, validationResult } = require('express-validator');
const { viewUser } = require('./AuthController');


module.exports = {
    create: (res,req) =>{
 
         const result = validationResult(req);
         const hasErrors = !result.isEmpty();
     
         if (hasErrors) {
           return res.status(400).send({ error: true,status_code: 400,message: result.array()});
         }


    try {
     
        //check if it exist
        models.memberships.findOne({where: {name: req.body.name }})
        .then(async function(membership){
            if(membership !== null){
                return res.status(201).send(
                responses.error(201,'membership with similar credentials already exists'));
            } else {
                 
                   
                    const Membership = await models.memberships.create(req.body);
                    if (Membership) {
                    
                      return res.status(200).send(responses.success(200, "Your Membership was successfully created.", Membership));
                    } else {
                      return res
                        .status(400)
                        .send(responses.error(400, "Unable to create User"));
                    }

            }
          });
    
  
        } catch (error) {
        return res
            .status(500)
            .send(
            responses.error(500, `Error creating a user ${error.message}`)
            );
        }
    },
    viewMembership: async(res,req) => {

    },
    list: (res,req) => {
      var whereConditions = {};    
      var offset = (req.query.offset) ? req.query.offset : 0;
      var limit = (req.query.limit) ? req.query.limit : 20;
      var orderBy = (req.query.orderBy) ? req.query.orderBy : 'id';
      var order = (req.query.order) ? req.query.order : 'ASC';
      var ordering = [
          [orderBy, order],
      ];
  
   
      
      models.users.findAndCountAll({
          offset: parseInt(offset), 
          limit: parseInt(limit),
          order: ordering,
         
      }).then(function(user){
        
          return res.status(200).send(responses.success(200,"Record was retreived successfully",user));
      })



    

    },
  


};