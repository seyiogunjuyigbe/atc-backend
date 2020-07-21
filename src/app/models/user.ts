import * as bcrypt from 'bcrypt';
import { arrayProp, prop, modelOptions, getModelForClass, Ref } from '@typegoose/typegoose';

import UserSchema from '../../db/schema/user';
import State from './state';
import Country from './country';
import Category from './category';

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
})
export default class User extends UserSchema {
  @prop({ ref: 'Country' })
  public country?: Ref<Country>;

  @arrayProp({ ref: 'State' })
  public states?: Ref<State>[];

  @arrayProp({ ref: 'Category' })
  public categories?: Ref<Category>[];

  @arrayProp({ ref: 'User' })
  public favoriteVendors?: Ref<User>[];

  public get name(): string {
    const name = `${this.firstName || ''} ${this.lastName || ''}`;
    return name === ' ' ? '' : name;
  }

  public comparePassword(password: string, cb?: Function) {
    if (!this.password && cb) {
      return cb(new Error('Registration not complete'), false);
    }

    if (!cb && this.password) {
      return bcrypt.compareSync(password, this.password);
    }

    if (cb) {
      bcrypt.compare(password, this.password, (err, isMatch) => {
        cb(err, isMatch);
      });
    }
  }
}

export const model = getModelForClass(User);
