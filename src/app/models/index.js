import * as path from 'path';
import { startCase } from 'lodash';
import { getModelForClass } from '@typegoose/typegoose';

const requireAll = require('require-all');
const models = requireAll({
  dirname: path.resolve(__dirname, './'),
  filter: /^(?!index)(.+)\.(ts|js)$/,
  resolve: (resource) => {
    return getModelForClass(resource.default);
  },
  map: (name, path) => startCase(name).replace(/\s+/g, ''),
});

export { models };
export default models;
