const bcrypt = require("bcryptjs");
const models = require('../models');
const _email = require("../services/emailService");
const responses = require("../helper/responses");
const hash = require("hashids");
const getJWT = require("../services/jwtService");
const uuidv1 = require("uuid/v1");
const { check, validationResult } = require('express-validator');

module.exports = {
 
  createUser: async (req, res) => {
     // username must be an email
       check(req.body.email).isEmail(),
  // password must be at least 8 chars long
      check(req.body.password).isLength({ min: 8 })
    const result = validationResult(req);
    const hasErrors = !result.isEmpty();

    if (hasErrors) {
      return res.status(400).send({
        error: true,
        status_code: 400,
        message: result.array()
      });
    }

    try {
      models.user.findByPk(req.body.roleID).then(function(role){
         if(role == null){
            return res.status(201)
            .send(
              responses.error(201,'The user role specified does not exist. Contact support team'));
         } else {
            //find the user by email
            models.users.findOne({where: {email: req.body.email }})
            .then(async function(user){
                if(user !== null){
                    return res.status(201).send(
                    responses.error(201,'An account with similar credentials already exists'));
                } else {
                     //create the new user account
                        let data = req.body;
                        let token = uuidv1();
                        data['token'] = token;

                        //hash password
                        let hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
                        data['password'] = hashedPassword;
                        data['isActive'] = false;
                        const Newuser = await models.users.create(data);
                        if (Newuser) {
                         // _email.sendEmailSignUpToken(Newuser, token);
                          let  url = generalFunctions.getURL();
                          let  resetURL = url + `auth/${Newuser.id}/verify/${token}`;
                          

                          let  MailTemplateName = 'account_activation.html';
                          let  MailData = {
                                name: data.firstName +' '+data.lastName,
                                email: data.email,
                                token: token,
                                resetURL: resetURL
                            };
                          let  MailRecipient = data.email;
                          let MailSubject = `Account verification - African Travel Club`;
                          let sendMail = _email.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
                          return res.status(200).send(responses.success(200, "Your account was successfully created. Please check your mail-box for verification steps", Newuser));
                        } else {
                          return res
                            .status(400)
                            .send(responses.error(400, "Unable to create User"));
                        }

                }
              });
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
  //resend Email auth token

ResendTokenEmail: (req, res) => {
  if(!req.params.email){
      return res
        .status(201)
        .send(
          responses.error(201, "Please provide Email")
        );
  }

  var email = req.params.email;
  models.users.findOne({
      where: {
          email: email
      }
  }).then(async function(user){
      if(!user)  return res.status(201).send(responses.error(201, "Found no user with these credentials"));

      //check if user is already active
      if(user.isActive === true) return res.status(201).send(responses.error(201, "Your account is already active. Token cannot be resent."));


      //check if token exists in the user's data
      if(!user.token) return res.status(201).send(responses.error(201, "Found no token in your account"));

      let  url = generalFunctions.getURL();
      let  resetURL = url + `auth/${user.id}/verify/${user.token}`;

      if(email){
          
       // _email.sendEmailResendToken(user, token);
        let MailTemplateName = 'Resend_Token.html';
            let MailData = {
                name: email,
                token: user.token,
                resetURL: resetURL
            };
            let MailRecipient = email;
            let MailSubject = `Account verification -  AfricanTravelclub account`;

            let sendMail =  _email.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject);
          return res.status(200).send(responses.success(200, "Token was Successfully sent", user));

      }

  });
},

//validate Email token to activate account
ValidateEmailToken: (req, res) => {
  if(!req.params.id || !req.params.token){
      return res.status(201).send(responses.error(201, "Please provide required fields"));
  }

  let id = req.params.id;
  let token = req.body.token;

  //find the user
  models.users.findOne({
      where: {
          id: id,
          token: token
      }
  }).then(async function(user){
      if(!user) return res.status(201).send(responses.error(201, "User does not exist"));

      var data = {
          token: null,
          isActive: true
      }
     
      //send mail notification
      
      if(user.email){
        //_email.sendEmailWelcome(user, token);
        let MailTemplateName = 'customerWelcomeMessage.html';
            let MailData = {
                name: user.firstName,
            };
            let MailRecipient = email;
            let MailSubject = `Welcome to African Trade Invest`;
            let notifyCustomer = _email.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject); 

      }
      models.users.update(data, {where: {id: user.id}}).then(function(updatedUser){
          return res.status(200).send(responses.success(200, "Your account was successfully activated.", user));

      })
  })

},

  viewUser: async (req, res) => {
    try {
      const user = await models.users.findByPk(req.params.userId);
      if (!user) {
        return res.status(400).send(responses.error(400, "User not found"));
      } else {
        return res
          .status(200)
          .send(
            responses.success(
              200,
              "User was retreived successfully",
              user
            )
          );
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error viewing a user ${error.message}`));
    }
  },

  login: async (req, res) => {
    try {
  
      const user = await models.users.findOne({ email: req.body.email });
      const userObj = { id: user.id, firstName: user.firstName,lastName: user.lastName,email: user.email };
 
      if (user) {
 

        if (bcrypt.compareSync(req.body.password, user.password)) {
          //generate a token
          const token = getJWT.generateToken({ userObj });
          //decode the token
          getJWT.decodeToken(token, (err, decoded) => {
            if (err) {
              return res
                .status(500)
                .send(responses.error(500, `Unable to decode token ${err}`));
            } else {
              return res.status(200).send(
                responses.success(200, "Logged in successfully", {
                  user,
                  token,
                  expiry: decoded.exp,
                  
                })
              );
            }
          });
        } else {
          return res
            .status(401)
            .send(responses.error(401, "Wrong email and password"));
        }
      } else {
        return res
          .status(401)
          .send(responses.error(401, "Wrong email and password"));
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error getting user ${error}`));
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const email = req.body.email;
      const address = req.headers.host;
      const user = await models.users.findOne({
        email
      });
     
      const token = uuidv1();
      if (!user) {
        return res
          .status(400)
          .send(responses.error(400, `User with ${email} doesn't exit`));
      } else {

            var data = {
              token:token ,
              passwordResetExpires : Date.now() + 86400000
             }
          if(email){

            var url = generalFunctions.getURL();
            var resetURL = url + 'reset-password/' + token;

            var MailTemplateName = 'forgotpassword.html';
            var MailData = {
                name: user.firstName + ' ' + user.lastName,
                token: token,
                resetURL: resetURL
            };
            var MailRecipient = email;
            var MailSubject = `Action required: Reset your password`;

            _email.sendTemplatedMail(MailTemplateName, MailData, MailRecipient, MailSubject)
            .then(response => response)
            .catch(error => {
              if (error) {
                return res
                  .status(500)
                  .send(
                    responses.error(500, "Forgot e-mail service is not working")
                  );
              }
            });

        }
        models.users.update(data, {where: {id: user.id}}).then(function(updatedUser){    
          return res.status(200).send(responses.success(200,`An e-mail has been sent to ${email} with further instructions.`,user));
        });
       
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error getting a user ${error.message}`));
    }
  },

  postReset: async (req, res) => {
    const { userId } = req.params;
    const user =  models.user.findOne({
      id: userId,
      passwordResetExpires: {
        $gte: Date.now()
      }
    });

    if (!user) {
      return res.status(400).send(responses.error(400,"User not found or Password reset has expired."));
    } else {
      const hashPwd = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(8),
        null
      );
      const data = {
        password:hashPwd ,
        passwordResetExpires :  undefined
       }
       
       models.users.update(data, {where: {id: user.id}}).then(function(updatedUser){    
        
        return res.status(200).send(responses.success(200,"You have successfully reset your password",updatedUser));
      });
      
      
    }
  },

  getReset: async (req, res, next) => {
    const { userId } = req.params;
    const user =  models.user.findOne({
      id: userId,
      passwordResetExpires: {
        $gte: Date.now()
      }
    });
    if (!user) {
      return res.status(400).send(responses.error(400,"user not found or Password reset has expired."));
    } else {
      return res.status(200).send(responses.success(200, "Reset Password link is still valid", user));
    }
  }
};
