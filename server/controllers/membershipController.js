
const models = require('../models');
const _email = require("../services/emailService");
const responses = require("../helper/responses");
const { check, validationResult } = require('express-validator');

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
    } 
};