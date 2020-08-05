const bcrypt = require('bcryptjs');
// const models = require('../models');
const { createCustomer } = require('../services/stripeService')
const {
  User
} = require('../models');
const _email = require('../services/emailService');
const responses = require('../helper/responses');
const hash = require('hashids');
const getJWT = require('../services/jwtService');
const jwt = require('jsonwebtoken');
const uuidv1 = require('uuid/v1');
const {
  check,
  validationResult
} = require('express-validator');
const generalFunctions = require('../helper/util');
const credential = require('../config/local');

module.exports = {
  createUser: async (req, res) => {
    // username must be an email
    check(req.body.email).isEmail(),
      // password must be at least 8 chars long
      check(req.body.password).isLength({
        min: 8
      });
    const result = validationResult(req);
    const hasErrors = !result.isEmpty();

    if (hasErrors) {
      return res.status(400).send({
        error: true,
        status_code: 400,
        message: result.array(),
      });
    }

    try {
      //find the user by email
      //models.users
      User.findOne({
        email: req.body.email
      })
        .then(async function (user) {
          if (user !== null) {
            return res.status(400).send(responses.error(400, 'An account with similar credentials already exists'));
          } else {
            //create the new user account
            const newUser = await User.create({
              ...req.body, token: uuidv1(), isActive: false
            });
            if (newUser) {
              // _email.sendEmailSignUpToken(Newuser, token);
              let customerDetails = await createCustomer(newUser);
              if (customerDetails && customerDetails.id) {
                newUser.stripeCustomerId = customerDetails.id
                await newUser.save()
              }
              let url = generalFunctions.getURL();
              let resetURL = url + `auth/${newUser.id}/verify/${newUser.token}`;

              let MailTemplateName = 'account_activation.html';
              let MailData = {
                name: newUser.firstName + ' ' + newUser.lastName,
                email: newUser.email,
                token: newUser.token,
                resetURL: resetURL,
              };
              let MailRecipient = newUser.email;
              let MailSubject = `Account verification - African Travel Club`;
              let sendMail = _email.sendTemplatedMail(
                MailTemplateName,
                MailData,
                MailRecipient,
                MailSubject,
              );
              return res
                .status(200)
                .send(
                  responses.success(
                    200,
                    'Your account was successfully created. Please check your mail-box for verification steps',
                    newUser,
                  ),
                );
            } else {
              return res
                .status(400)
                .send(responses.error(400, 'Unable to create User'));
            }
          }
        });
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error creating a user ${error.message}`));
    }
  },
  //resend Email auth token

  ResendTokenEmail: (req, res) => {
    if (!req.params.email) {
      return res.status(400).send(responses.error(400, 'Please provide Email'));
    }

    var email = req.params.email;
    User.findOne({
      email
    })
      .then(async function (user) {
        if (!user)
          return res
            .status(400)
            .send(responses.error(400, 'Found no user with these credentials'));

        //check if user is already active
        if (user.isActive === true)
          return res
            .status(400)
            .send(
              responses.error(
                400,
                'Your account is already active. Token cannot be resent.',
              ),
            );

        //check if token exists in the user's data
        if (!user.token)
          return res
            .status(400)
            .send(responses.error(400, 'Found no token in your account'));

        let url = generalFunctions.getURL();
        let resetURL = url + `auth/${user.id}/verify/${user.token}`;

        if (email) {
          // _email.sendEmailResendToken(user, token);
          let MailTemplateName = 'Resend_Token.html';
          let MailData = {
            name: email,
            token: user.token,
            resetURL: resetURL,
          };
          let MailRecipient = email;
          let MailSubject = `Account verification -  AfricanTravelclub account`;

          let sendMail = _email.sendTemplatedMail(
            MailTemplateName,
            MailData,
            MailRecipient,
            MailSubject,
          );
          return res
            .status(200)
            .send(responses.success(200, 'Token was Successfully sent', user));
        }
      });
  },

  //validate Email token to activate account
  ValidateEmailToken: (req, res) => {
    if (!req.params.userId || !req.params.token) {
      return res
        .status(201)
        .send(responses.error(201, 'Please provide required fields'));
    }

    let id = req.params.userId;
    let token = req.body.token;

    //find the user
    User.findOne({
      id,
      token
    })
      .then(async function (user) {
        if (!user)
          return res
            .status(201)
            .send(responses.error(201, 'User does not exist'));

        var data = {
          token: null,
          isActive: true,
        };

        //send mail notification

        if (user.email) {
          //_email.sendEmailWelcome(user, token);
          var MailTemplateName = 'customerWelcomeMessage.html';
          var MailData = {
            name: user.firstName,
          };
          var MailRecipient = email;
          var MailSubject = 'Welcome to African Trade Invest';
          _email.sendTemplatedMail(
            MailTemplateName,
            MailData,
            MailRecipient,
            MailSubject,
          );
        }
        User
          .findByIdAndUpdate(user.id, {
            ...data
          })
          .then(function (updatedUser) {
            return res
              .status(200)
              .send(
                responses.success(
                  200,
                  'Your account was successfully activated.',
                  user,
                ),
              );
          });
      });
  },

  viewUser: (req, res) => {
    try {
      const user = User.findById(req.params.userId);
      if (!user) {
        return res.status(400).send(responses.error(400, 'User not found'));
      } else {
        return res
          .status(200)
          .send(
            responses.success(200, 'User was retreived successfully', user),
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
      console.log(req.body)
      if (
        ['facebook', 'google'].includes(req.body.strategy) &&
        !req.body.access_token
      ) {
        return res.status(401).send(
          responses.error(401, 'Invalid access token'),
        );
      }

      const strategy = req.body.strategy ?
        `${req.body.strategy}-token` :
        'local';

      return passport.authenticate(
        strategy, { session: false }, async (err, user, info) => {
          try {
            const errored = err || info;
            if (errored) {
              throw createError(401, errored);
            }

            await user.updateOne({ lastLoginAt: new Date() });

            let token = jwt.sign({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            },
              credential.jwtSecret, {
              expiresIn: 604800, // expires in 7 days
            },
            );

            return res
              .status(200)
              .send(
                responses.success(200, 'Logged in successfully', {
                  user,
                  token,
                  expiresIn: 604800,
                }),
              );
          } catch (error) {
            next(error);
          }
        })(req, res, next);
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .send(responses.error(500, `Error getting user ${error}`));
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const email = req.query.email;
      const address = req.headers.host;
      const user = await User.findOne({
        email
      });

      const token = uuidv1();
      if (!user) {
        return res
          .status(400)
          .send(responses.error(400, `User with ${email} doesn't exit`));
      } else {
        var data = {
          token: token,
          passwordResetExpires: Date.now() + 86400000,
        };
        if (email) {
          var url = generalFunctions.getURL();
          var resetURL = url + '/auth/reset-password' + token;

          var MailTemplateName = 'forgotpassword.html';
          var MailData = {
            name: user.firstName + ' ' + user.lastName,
            token: token,
            resetURL: resetURL,
          };
          var MailRecipient = email;
          var MailSubject = `Action required: Reset your password`;

          _email
            .sendTemplatedMail(
              MailTemplateName,
              MailData,
              MailRecipient,
              MailSubject,
            )
            .then(response => response)
            .catch(error => {
              if (error) {
                return res
                  .status(500)
                  .send(
                    responses.error(
                      500,
                      'Forgot e-mail service is not working',
                    ),
                  );
              }
            });
        }
        User.findByIdAndUpdate(user.id, {
          ...data
        })
          .then(function (updatedUser) {
            return res
              .status(200)
              .send(
                responses.success(
                  200,
                  `An e-mail has been sent to ${email} with further instructions.`,
                  user,
                ),
              );
          });
      }
    } catch (error) {
      return res
        .status(500)
        .send(responses.error(500, `Error getting a user ${error.message}`));
    }
  },

  postReset: async (req, res) => {
    const {
      userId
    } = req.params;
    const user = User.findOne({
      _id: userId,
      passwordResetExpires: {
        $gte: Date.now(),
      },
    });

    if (!user) {
      return res
        .status(400)
        .send(
          responses.error(400, 'User not found or Password reset has expired.'),
        );
    } else {
      const hashPwd = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(8),
        null,
      );
      const data = {
        password: hashPwd,
        passwordResetExpires: undefined,
      };

      User.findByIdAndUpdate(user.id, {
        ...data
      })
        .then(function (updatedUser) {
          return res
            .status(200)
            .send(
              responses.success(
                200,
                'You have successfully reset your password',
                updatedUser,
              ),
            );
        });
    }
  },

  getReset: async (req, res, next) => {
    const {
      userId
    } = req.params;
    const user = User.findOne({
      id: userId,
      passwordResetExpires: {
        $gte: Date.now(),
      },
    });
    if (!user) {
      return res
        .status(400)
        .send(
          responses.error(400, 'user not found or Password reset has expired.'),
        );
    } else {
      return res
        .status(200)
        .send(
          responses.success(200, 'Reset Password link is still valid', user),
        );
    }
  },
};
