import * as createError from 'http-errors';
const validator = require('lx-valid');
// import logger from './logger';

try {
  validator.extendFormat('currency-code', /^[A-Za-z]{3}$/);
} catch (e) {
  console.error(e);
}

export const validate = (object: any, schema: any, options: any) => {
  const fn = options.isUpdate ? validator.getValidationFunction() : validator.validate;
  const result = fn(object, schema, Object.assign({ cast: true }, options));

  if (!result.valid) {
    const msg = `'${result.errors[0].property}' ${result.errors[0].message}`;
    throw createError(400, msg, result.errors);
  }
};
