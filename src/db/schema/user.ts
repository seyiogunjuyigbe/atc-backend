import { index, pre, prop } from '@typegoose/typegoose';
import validator from 'validator';
import { sampleSize } from 'lodash';

import Base from './base';
import { hashPassword } from '../../shared/util/account';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

enum Role {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

enum Status {
  BLOCKED = 'blocked',
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}

enum SubscriptionStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

@pre<UserSchema>('save', function () {
  if (this.password) {
    this.password = hashPassword(this.password);
  }
})
@index({ email: 1, isDeleted: 1 }, { unique: true, sparse: true })
export default class UserSchema extends Base {
  @prop({
    lowercase: true,
    validate: {
      validator: (v) => {
        return validator.isEmail(v);
      },
      message: '{VALUE} is not a valid email',
    },
  })
  public email?: string;

  @prop({ minlength: 6, hide: true, hideJSON: true })
  public password?: string;

  @prop({ required: true })
  public firstName!: string;

  @prop()
  public phone?: string;

  @prop({ enum: Role, default: Role.CUSTOMER })
  public role?: string;

  @prop({ enum: Gender })
  public gender?: string;

  @prop({ required: true })
  public lastName!: string;

  @prop({ default: false })
  public emailVerified?: boolean;

  @prop({ default: false })
  public isVerified?: boolean;

  @prop()
  public profilePicUrl?: string;

  @prop()
  public address?: string;

  @prop()
  public bio?: string;

  @prop()
  public links?: string[];

  @prop({ enum: Status, default: Status.AVAILABLE })
  public status?: string;

  @prop()
  public companyName?: string;

  @prop()
  public companyDescription?: string;

  @prop()
  public website?: string;

  @prop({ default: SubscriptionStatus.INACTIVE })
  public subscriptionStatus?: string;
}
