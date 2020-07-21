import { DocumentType, modelOptions, prop, plugin } from '@typegoose/typegoose';
import isDeleted from '../plugins/is_deleted';

@plugin(isDeleted)
@modelOptions({
  schemaOptions: {
    toJSON: {
      virtuals: true, getters: true, transform: (doc, ret, options) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true, getters: true, transform: (doc, ret, options) => {
        delete ret.password;
        return ret;
      },
    },
    timestamps: true,
  },
})
export default class Base {
  public async reload(this: DocumentType<Base>) {
    return await (this.constructor as any).findById(this.id);
  }

  public static async last(this: Base, query = {}) {
    const lastRecord = await (this as any).find(query).sort({ _id: -1 }).limit(1);
    return lastRecord[0];
  }
}
