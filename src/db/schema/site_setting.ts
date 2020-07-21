import { index, prop } from '@typegoose/typegoose';

import Base from './base';

@index({ optionKey: 1, isDeleted: 1 }, { unique: true, sparse: true })
export default class SiteSettingSchema extends Base {
  @prop({ required: true })
  public optionKey!: string;

  @prop({ required: true })
  public optionValue!: string;
}
