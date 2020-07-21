import * as createError from 'http-errors';
import * as m from 'moment';
import * as config from '../../../config';

const { controller, del, get, post, put, route } = require('route-decorators');

import { IContext } from '../../shared/interface/controller';
import { DocumentType } from '@typegoose/typegoose';
import {
  authenticate, loadAbilities, multerUpload,
} from '../middlewares';
import baseController from './app.controller';

import USER, { model as User } from '../models/user';
import { model as OTP } from '../models/otp';
import { model as State } from '../models/state';
import { model as Category } from '../models/category';
import { IRequest } from '../../shared/interface/request';
import { EMAIL_VERIFICATION } from '../../shared/constants/account';
import { sendVerificationOtp } from '../mailer/templates/main/user';
import { getToken } from '../../shared/util/account';
import { model as Package } from '../models/package';
import { model as Subscription } from '../models/subscription';
import { uniq } from 'lodash';
import { model as Visit } from '../models/visit';

@controller('/users')
export default class UsersController extends baseController {
  constructor() {
    super();
    this.uniqueFields = ['email'];
  }

  @post(loadAbilities)
  public async signup() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: true,
      },
    };

    try {

      this.setParamsPermissionRules(req);

      let newUser = await User.findOne({
        email: req.body.email,
        isDeleted: false,
      });

      if (newUser && newUser.password) {
        throw createError(422, 'User already exist');
      }

      if (!newUser) {
        newUser = await super.create(ctx) as DocumentType<USER>;
        if (!newUser) {
          throw createError(422, 'Unable to create user account.');
        }
      }

      let otp;
      let token;
      if (newUser.email) {
        otp = new OTP({
          action: EMAIL_VERIFICATION, user: newUser.id,
        });

        await otp.save();

        sendVerificationOtp(
          newUser, otp.token,
        );
      } else {
        token = getToken(newUser);
      }

      return res.send({
        token,
        otp: otp && otp.token,
        id: newUser.id,
        message: `User created ${otp && otp.token ? 'and OTP sent' : 'successfully'}.`,
      });
    } catch (e) {
      next(e);
    }
  }

  @get(authenticate, loadAbilities)
  public async listUsers() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: false,
        searchOptions: {
          defaultOrderColumn: 'firstName',
        },
      },
    };

    const extraQuery: any = {};

    try {
      await super.all(ctx);
    } catch (err) {
      next(err);
    }
  }

  @get('/search', authenticate, loadAbilities)
  public async searchUsers() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: false,
        searchOptions: {
          defaultOrderColumn: 'firstName',
        },
      },
    };

    try {
      if (!req.query.q) {
        throw createError(400, 'query parameter missing');
      }

      const extraQuery: any = {
        $and: [
          {
            _id: {
              $ne: req.auth.id, // don't return logged in user
            },
          },
        ],
      };

      if (
        !req.query.role &&
        ['customer', 'vendor'].includes(req.user.role)
      ) {
        extraQuery.$and.push({ role: 'vendor' });
      } else {
        if (req.query.role) {
          extraQuery.$and.push({ role: req.query.role });
        }
      }

      let orQueries = [];

      const searchBy = req.query.by || 'all';

      if (['location', 'all'].includes(searchBy)) {
        const matchedStates = await State.find({
          name: { $regex: req.query.q, $options: 'i' },
        });

        if (matchedStates && matchedStates.length) {
          orQueries.push(
            {
              states: {
                $in: matchedStates.map(state => state.id),
              },
            },
          );
        }
      }

      if (['category', 'all'].includes(searchBy)) {
        const matchedCategories = await Category.find({
          name: { $regex: req.query.q, $options: 'i' },
        });

        if (matchedCategories && matchedCategories.length) {
          orQueries.push(
            {
              categories: {
                $in: matchedCategories.map(state => state.id),
              },
            },
          );
        }
      }

      if (['name', 'all'].includes(searchBy)) {
        orQueries = orQueries.concat(
          [
            { firstName: { $regex: req.query.q, $options: 'i' } },
            { lastName: { $regex: req.query.q, $options: 'i' } },
          ],
        );
      }

      if (orQueries.length) {
        extraQuery.$and.push({ $or: orQueries });
      }

      ctx.options.extraQuery = extraQuery;

      delete ctx.req.query.q;
      delete ctx.req.query.by;
      delete ctx.req.query.role;

      await super.all(ctx);
    } catch (err) {
      next(err);
    }
  }

  @get('/:userId', authenticate, loadAbilities)
  public async viewUser() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: true,
      },
    };

    try {
      const user = await super.findOne(ctx);

      // register visit on read
      if (req.auth.id.toString() !== user.id.toString() && req.user.role !== 'admin') {
        await Visit.create({
          host: req.params.userId,
          visitor: req.auth.id,
        });
      }

      res.send({
        data: {
          ...user.toJSON(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  @get('/:userId/visits', authenticate, loadAbilities)
  public async getUserVisits() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: false,
        searchOptions: {
          defaultOrderColumn: 'firstName',
        },
      },
    };

    try {
      ctx.model = Visit;

      return await super.all(ctx);
    } catch (err) {
      next(err);
    }
  }

  @put('/:userId', authenticate, loadAbilities)
  public async updateUser() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: true,
      },
    };

    try {
      let passwordChanged;
      this.setParamsPermissionRules(req, true);

      if (req.body.email) delete ctx.req.body.email;

      const attributes = Object.keys(req.body);
      const user = await User.findById(req.params.userId) as DocumentType<USER>;

      if (attributes.indexOf('password') > -1) {
        if (!req.body.oldPassword) {
          throw createError(400, 'Password update requires old password.');
        }

        if (!user.comparePassword(req.body.oldPassword)) {
          throw createError(400, 'Incorrect password entered.');
        }

        user.password = req.body.password;
        await user.save();

        passwordChanged = true;
        delete req.body.password;
      }

      const instance = await super.update(ctx);
      res.send({
        data: instance,
        message: 'User successfully updated.',
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/:userId/login-details', authenticate, loadAbilities)
  public saveLoginDetails = this.changeEmail;

  @post('/:userId/change-email', authenticate, loadAbilities)
  public async changeEmail() {
    const [req, res, next]: any = arguments;

    try {
      if (req.auth.id !== req.params.userId && req.user.role !== 'admin') {
        throw createError(401, 'You are not authorized to modify this resource');
      }

      if (!req.body.password || !req.body.email) {
        throw createError(400, 'Password/Email missing.');
      }

      const isSavingLoginDetails = req.path.includes('login-details');

      const user = await User.findById(req.params.userId) as DocumentType<USER>;

      const oldEmail = user.email;

      if (!isSavingLoginDetails && !user.comparePassword(req.body.password)) {
        throw createError(400, 'Incorrect password entered.');
      }

      if (isSavingLoginDetails) {
        if (user.password) {
          throw createError(400, 'Login details already saved');
        }

        user.email = req.body.email;
        user.password = req.body.password;
        await user.save();
      } else {
        await user.updateOne({ email: req.body.email });
      }

      res.send({
        message: isSavingLoginDetails
          ? 'Login details saved successfully'
          : 'User email successfully changed.',
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/:userId/upload-image', authenticate, loadAbilities, multerUpload().single('image'))
  public async uploadProfilePic() {
    const [req, res, next]: any = arguments;

    try {
      const uploadedFile: any = req.file;
      if (!uploadedFile) {
        throw createError(400, 'No image uploaded');
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        throw createError(400, 'User not found');
      }

      await user.updateOne({ profilePicUrl: uploadedFile.path });

      res.send({
        message: 'User image successfully uploaded.',
        url: uploadedFile.path,
      });
    } catch (err) {
      next(err);
    }
  }

  @post('/:vendorId/favorite', authenticate, loadAbilities)
  public async favoriteVendor() {
    const [req, res, next]: any = arguments;

    try {
      const user = await User.findById(req.params.vendorId);

      if (!user) {
        throw createError(400, 'User not found');
      }

      if (user.role !== 'vendor') {
        throw createError(400, 'User not a vendor');
      }

      req.user.favoriteVendors = req.body.action === 'add'
        ? uniq([...req.user.favoriteVendors, user.id])
        : req.user.favoriteVendors.filter(vendor => vendor !== user.id);

      await req.user.save();

      res.send({
        message: 'Vendor favorited successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  @del('/:userId', authenticate, loadAbilities)
  public async deleteUser() {
    const [req, res, next]: any = arguments;
    const ctx: IContext = {
      req,
      res,
      next,
      options: {
        returnInstance: false,
      },
    };

    try {
      await super.destroy(ctx);
    } catch (err) {
      next(err);
    }
  }

  @post('/:userId/subscribe', authenticate, loadAbilities, multerUpload().single('image'))
  public async subscribeToPackage() {
    const [req, res, next]: any = arguments;

    try {
      if (!req.body.packageId) {
        throw createError(400, 'packageId is missing');
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        throw createError(400, 'User not found');
      }

      const subscriptionPackage = await Package.findById(req.body.packageId);
      if (!subscriptionPackage) {
        throw createError(400, 'Invalid package');
      }

      const newSubscription = await Subscription.create({
        owner: req.auth.id,
        subscribedTo: subscriptionPackage.id,
        expiryDate: m.utc().add(1, 'month').startOf('day').toDate(),
      });

      await user.updateOne({ subscriptionStatus: 'active' });

      res.send({
        message: 'User successfully subscribed to package.',
        subscription: newSubscription,
      });
    } catch (err) {
      next(err);
    }
  }

  private setParamsPermissionRules(req?: IRequest, isUpdate?: boolean) {
    const { body, user } = req as IRequest;
    isUpdate = isUpdate || false;
    const stringAndRequired = {
      minLength: 1,
      required: true,
      type: 'string',
    };

    this.fields = {
      firstName: {
        ...stringAndRequired,
        required: !isUpdate,
      },
      lastName: {
        ...stringAndRequired,
        required: !isUpdate,
      },
      email: {
        type: 'string',
        format: 'email',
      },
      password: {
        type: 'string',
        minLength: 6,
      },
      oldPassword: {
        type: 'string',
        required: !!body.password && isUpdate,
        minLength: 6,
      },
      role: {
        type: 'string',
        enum: ['admin', 'vendor', 'customer'],
      },
      gender: {
        type: 'string',
        enum: ['male', 'female'],
      },
      phone: {
        type: 'string',
      },
      states: {
        type: 'array',
        items: {
          type: 'string',
          format: 'mongo-id',
        },
      },
      categories: {
        type: 'array',
        items: {
          type: 'string',
          format: 'mongo-id',
        },
      },
      country: {
        type: 'string',
        format: 'mongo-id',
      },
      address: {
        type: 'string',
      },
      companyName: {
        type: 'string',
      },
      companyDescription: {
        type: 'string',
      },
      website: {
        type: 'string',
      },
      bio: {
        type: 'string',
      },
      links: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    };
  }
}
