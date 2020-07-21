import { Router } from 'express';
import * as createError from 'http-errors';
import { camelCase, startCase, isString, kebabCase } from 'lodash';
import { ReturnModelType, isDocument } from '@typegoose/typegoose';

import { IContext } from '../../shared/interface/controller';
import { validate } from '../services/validator';
import {
  getModelFromControllerName,
  getAction,
  buildIncludeQuery,
  buildOrQuery,
  buildValue,
} from '../../shared/util/app';

import BaseModel from '../../db/schema/base';
import { IRequest } from '../../shared/interface/request';

export default class AppController {
  private modelName: string;
  public ctx?: IContext;
  public model: ReturnModelType<typeof BaseModel>;
  public fields: any;
  public validateOptions: any;
  public router?: Router;
  public uniqueFields?: string[];
  public $routes?: any[];

  public constructor(modelName?: string) {
    this.modelName = modelName as string;
    this.model = getModelFromControllerName(this.constructor.name, this.modelName);
    if (!this.modelName && this.model) this.modelName = this.model.modelName.replace('Model', '');
  }

  public async create(ctx: IContext) {
    try {
      // this.checkPermission(ctx);
      this.permitAndValidateParams(ctx.req.body);
      await this.checkUniqness(ctx);

      const instance = await this.model.create(ctx.req.body);

      if (!instance) {
        throw createError(400, `${this.modelName} could not be created.`);
      }

      return (ctx.options as any).returnInstance ? instance : ctx.res.send({
        data: instance.toJSON(),
        message: `${this.modelName} created successfully.`,
      });
    } catch (e) {
      throw e;
    }
  }

  public async all(ctx: IContext) {
    try {
      // this.checkPermission(ctx);
      let query = ctx.req.query;
      const limit = parseInt((query.$limit as string) || '10', 10);
      const offset = parseInt((query.$offset as string) || '0', 10);
      const populate = query.$include;
      let or = query.$or;
      const order = query.$order || (ctx.options as any).searchOptions.defaultOrderDirColumn || 'asc';
      const orderBy = query.$orderBy || (ctx.options as any).searchOptions.defaultOrderColumn;
      const model = ctx.model || this.model;

      delete query.$limit;
      delete query.$offset;
      delete query.$include;
      delete query.$or;
      delete query.$order;
      delete query.$orderBy;

      if (ctx.req.user && ctx.req.user.role !== 'admin') {
        query.isDeleted = 'false';
      }

      Object.keys(query).forEach((key) => {
        const q = (query as any)[key] as string;
        if (q.includes('|')) {
          const queryString = `${key}:${q}`;
          or = or === '' ? queryString : `${or},${queryString}`;

          delete query[key];
        } else {
          query[key] = buildValue(q) as any;
        }
      });

      query = buildOrQuery((or as any), query);

      query = { ...query, ...(ctx.options.extraQuery || {}) };

      const total = await model.countDocuments(query);

      const cursor = model.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ [orderBy]: order });

      const data = await buildIncludeQuery((populate as any), cursor);

      const response = {
        data,
        meta: { limit, offset, total },
      };

      return (ctx.options as any).returnInstance
        ? response
        : ctx.res.send(response);
    } catch (e) {
      throw e;
    }
  }

  public async findOne(ctx: IContext) {
    try {
      const populate = ctx.req.query.$include;
      const id = this.getId(ctx);

      const cursor = this.model.findById(id);
      const instance = await buildIncludeQuery((populate as any), cursor);
      if (!instance) {
        throw createError(404, `${this.modelName} with the id does not exist`);
      }

      // this.checkPermission(ctx, instance);

      return (ctx.options as any).returnInstance
        ? instance : ctx.res.send({ data: instance.toJSON() });
    } catch (e) {
      throw e;
    }
  }

  public async update(ctx: IContext) {
    try {
      this.permitAndValidateParams(ctx.req.body, true);
      const id = this.getId(ctx);
      let modelInstance: any = await this.model.findById(id);
      if (!modelInstance) {
        throw createError(404, `${this.modelName} with the id does not exist`);
      }

      // this.checkPermission(ctx, modelInstance);

      const updatedInstance = await modelInstance.updateOne(
        Object.assign({}, modelInstance.toJSON(), ctx.req.body),
      );

      if (!updatedInstance) {
        throw createError(422, `${this.modelName} could not be updated.`);
      }

      modelInstance = await modelInstance.reload();

      return (ctx.options as any).returnInstance ? modelInstance : ctx.res.send({
        data: modelInstance.toJSON(),
        message: `${startCase(this.modelName)} updated successfully.`,
      });
    } catch (e) {
      throw e;
    }
  }

  public async destroy(ctx: IContext, archive = true) {
    try {
      const id = this.getId(ctx);
      const where = { _id: id };
      const fields = Object.keys(ctx.req.query);
      const permanently = ctx.req.user
        && ctx.req.user.role === 'admin'
        && ctx.req.query.permanently === 'yes';

      delete ctx.req.query.permanently;

      fields.forEach((field) => {
        const value = ctx.req.query[field];
        (where as any)[field] = value;
      });

      const instance = await this.model.findOne(where);
      if (!instance) {
        throw createError(404, `${this.modelName} does not exist`);
      }

      // this.checkPermission(ctx, instance);

      const deleted = archive && !permanently
        ? await instance.updateOne({ isDeleted: true })
        : await instance.remove();

      if (!deleted) {
        throw createError(422, `${this.modelName} could not be deleted.`);
      }

      return (ctx.options as any).returnInstance
        ? deleted
        : ctx.res.send({ message: `${this.modelName} successfully deleted.` });
    } catch (e) {
      throw e;
    }

  }

  private permitAndValidateParams(body: any, isUpdate = false) {
    let options = {
      isUpdate,
      strictRequired: !isUpdate,
      unknownProperties: 'delete',
      trim: true,
    };

    if (this.validateOptions) {
      options = Object.assign(options, this.validateOptions);
    }

    validate(
      body,
      {
        properties: this.fields,
      },
      options,
    );
  }

  public checkPermission(ctx: IContext, instance: any = this.modelName, req?: IRequest) {
    let action;
    let request;
    if (isString(ctx)) {
      action = ctx;
      request = req;
    } else {
      action = getAction(ctx.req.method);
      request = ctx.req;
    }

    if (action === 'create' && ctx.req.params[this.getIdParamKey(ctx)]) {
      action = 'update';
    }
    console.log({ action, instance });

    if (!(request as IRequest).ability.can(action, instance)) {
      throw createError(403, 'You are not authorized to access this endpoint');
    }
  }

  public selfValidate(body: any) {
    validate(
      body,
      {
        properties: this.fields,
      },
      {
        strictRequired: true,
        unknownProperties: 'delete',
        trim: true,
      },
    );
  }

  private async checkUniqness(ctx: IContext) {
    if (!(this.uniqueFields as string[]).length) {
      return;
    }

    const where = (this.uniqueFields as string[]).reduce(
      (acc, curValue) => {
        (acc as any)[curValue] = ctx.req.body[curValue];
        return acc;
      },
      { isDeleted: false },
    );

    const exists = await this.model.findOne(where);

    if (exists) {
      throw createError(422, {
        message: `${this.modelName} already exists.`,
      });
    }
  }

  private getId(ctx: IContext) {
    const paramKey = this.getIdParamKey(ctx);
    const id = ctx.req.params[paramKey];
    if (!id) {
      throw createError(400, `Missing ${paramKey} parameter`);
    }

    return id;
  }

  private getIdParamKey(ctx: IContext) {
    return ((ctx.options || {}) as any).paramKey || `${camelCase(this.model.modelName)}Id`;
  }
}
