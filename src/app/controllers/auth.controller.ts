import { NextFunction, Response } from 'express';

const { controller, get, post } = require('route-decorators');

import * as createError from 'http-errors';
import * as passport from 'passport';

import { IRequest } from '../../shared/interface/request';
import { getToken, verifyOTP } from '../../shared/util/account';
import { authenticate, loadAbilities } from '../middlewares';
import { validate } from '../services/validator';

import AppController from './app.controller';
import { EMAIL_VERIFICATION, RESET_PASSWORD } from '../../shared/constants/account';

import USER, { model as User } from '../models/user';
import { model as Otp } from '../models/otp';
import { DocumentType, isDocument } from '@typegoose/typegoose';
import path = require('path');
import { sendVerificationOtp, sendResetPasswordEmail } from '../mailer';

@controller('')
export default class AuthController extends AppController {
  @get('/auth/reset-password')
  public resetPassword = this.initiateEmailVerification;

  @get('/auth/reauth', authenticate)
  public async reAuth(req: IRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.auth.id);
      if (!user) {
        throw createError(401, 'Invalid token sent');
      }

      res.send(getToken(user));
    } catch (error) {
      next(error);
    }
  }

  @post('/auth/login')
  public login(req: IRequest, res: Response, next: NextFunction) {
    validate(
      req.body,
      {
        properties: {
          email: {
            type: 'string',
            format: 'email',
            required: true,
          },
          password: {
            type: 'string',
            minLength: 6,
            required: true,
          },
          shortTokenExpiry: {
            type: 'boolean',
            required: false,
          },
        },
      },
      {
        strictRequired: true,
        unknownProperties: 'delete',
      });

    return passport.authenticate(
      'local', { session: false }, async (err, user: DocumentType<USER>, info) => {
        try {
          const errored = err || info;
          if (errored) {
            throw createError(401, errored);
          }

          await user.updateOne({ lastLoginAt: new Date() });

          const result = getToken({
            shortTokenExpiry: req.body.shortTokenExpiry || false,
            ...user.toJSON(),
          });

          return res.send(result);
        } catch (error) {
          next(error);
        }
      })(req, res, next);
  }

  @get('/auth/:type/:otp')
  public async verifyAccount(req: IRequest, res: Response, next: NextFunction) {
    try {
      const owner = await verifyOTP(req);

      let verifiedUser;
      const foundUser: any = owner;

      if (isDocument(foundUser)) {
        await foundUser.updateOne({ emailVerified: true });
        verifiedUser = getToken(foundUser);
      }

      return res.status(200).json(verifiedUser);
    } catch (error) {
      next(error);
    }
  }

  @get('/verification/verify-email')
  public async verifyEmail(req: IRequest, res: Response, next: NextFunction) {
    try {
      const email: any = req.query.email;

      if (!email) {
        return res.sendFile(path.join(__dirname, '../mailer/htmls/invalidemail.html'));
      }

      const foundUser = await User.findOne({ email });

      if (!foundUser) {
        return res.sendFile(path.join(__dirname, '../mailer/htmls/invalidemail.html'));
      }

      await foundUser.updateOne({ emailVerified: true });

      return res.sendFile(path.join(__dirname, '../mailer/htmls/verificationsuccess.html'));
    } catch (error) {
      next(error);
    }
  }

  @get('/auth/get-verification-email')
  public async initiateEmailVerification(req: IRequest, res: Response, next: NextFunction) {
    try {
      const email: any = req.query.email;

      if (!email) {
        throw createError(400, 'email is required.');
      }

      const foundUser = await User.findOne({ email });

      const isPasswordReset = req.path.includes('reset-password');
      const messageType = isPasswordReset ? 'Reset password' : 'Verification';
      const message = `${messageType} email will be sent if the email address exists.`;

      if (!foundUser) {
        throw createError(404, message);
      }

      const codeQuery: any = {
        action: isPasswordReset ? RESET_PASSWORD : EMAIL_VERIFICATION,
        user: foundUser.id,
      };

      let foundToken: any = await Otp.findOne(codeQuery);
      if (!foundToken) {
        foundToken = await Otp.create(codeQuery);
      }

      await foundToken.updateOne({ expires: new Date(Date.now() + 3600000) });
      foundToken = await Otp.findOne(codeQuery);

      const emailSent = isPasswordReset
        ? await sendResetPasswordEmail(foundUser, foundToken.token)
        : await sendVerificationOtp(foundUser, foundToken.token, false);

      if (!emailSent) {
        return { message: 'Email could not be sent.' };
      }

      return res.status(200).json({ message, foundToken });
    } catch (error) {
      next(error);
    }
  }

  @post('/auth/reset-password', authenticate)
  public async setPassword(req: IRequest, res: Response, next: NextFunction) {
    try {
      const password = req.body.password;
      if (!password) {
        throw createError(400, 'password cannot be blank');
      }

      if (password.length < 6) {
        throw createError(400, 'password must be at least 6 characters long.');
      }

      const foundUser = await User.findById(req.auth.id) as DocumentType<USER>;
      foundUser.password = password;

      await foundUser.save();

      res.send({
        message: 'Password successfully changed.',
        data: foundUser.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/auth/profile', authenticate)
  public async getCurrentUser(req: IRequest, res: Response, next: NextFunction) {
    try {
      if (!req.auth) {
        throw createError(400, 'User not authenticated.');
      }

      const foundUser = await User.findById(req.auth.id);

      if (!foundUser) {
        throw createError(404, 'User not found.');
      }

      return res.status(200).json({
        ...foundUser.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  @post('/:userId/verify-password', authenticate, loadAbilities)
  public async verifyPassword() {
    const [req, res, next]: any = arguments;

    try {
      if (!Boolean(Number(req.params.userId))) {
        throw createError(400, 'Missing required parameter `userId`');
      }

      if (!req.body.password) {
        throw createError(400, 'Missing required field `password`');
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        throw createError(404, 'User not found.');
      }

      // Check permission on the instance
      if (!req.ability.can('verify-password', user)) {
        throw createError(403, 'You are not authorized to perform this action.');
      }

      if (!user.comparePassword(req.body.password)) {
        throw createError(400, 'Password is incorrect');
      }

      res.send({
        message: 'Password is valid',
        authorized: true,
      });
    } catch (err) {
      next(err);
    }
  }
}
