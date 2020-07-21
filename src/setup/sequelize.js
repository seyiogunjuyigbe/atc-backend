const { models } = require('../app/models');
const { Sequelize } = require('sequelize-typescript');
const { Op } = require('sequelize');
const cls = require('cls-hooked');

const config = require('../../config');
const dbConfigPath = config.get('env') === 'test' ? 'testDbUrl' : 'modules.sequelize.url';
const loggingDisabled = config.get('modules.sequelize.logging') === 'false';

export const namespace = cls.createNamespace('manator');
export const dbUrl = config.get(dbConfigPath);

Sequelize.useCLS(namespace);
const sequelize = new Sequelize(dbUrl, {
  logging: loggingDisabled ? false : console.log,
  models: Object.keys(models).map(k => models[k]),
  operatorsAliases: {
    $or: Op.or,
    $and: Op.and,
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
  },
});

export default sequelize;
