const { NextFunction, Response } = require('express');
const expressJwt = require('express-jwt');
const createError = require('http-errors');
const { IRequest } = require('../../shared/interface/request');
const { defineAbilitiesFor } = require('../../setup/ability');
const { flattenSettings, multerCloudinaryStorage } = require('../../shared/util/app');
const multer = require('multer');

const { model: SiteSetting } = require('../models/site_setting');
const UserModel = require('../models/user');
const User = UserModel.model;

const config = require('../../../config');
const SECRET = config.get('security.secret');

export const authenticate = expressJwt({
  requestProperty: 'auth',
  secret: SECRET,
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
});

export const hasToken = (req, res, next) => {
  return req.headers.authorization && req.headers.authorization !== '';
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    throw createError(403, 'You are not authorized to perform this action.');
  }

  next();
};

export const loadAbilities = async (req, res, next) => {

  try {
    if (req.auth) {
      req.user = await User.findById(req.auth.id);
    }

    req.ability = defineAbilitiesFor(req);
    req.settings = flattenSettings(await SiteSetting.find());
    next();
  } catch (error) {
    next(error);
  }
};

export const multerUpload = (dirname) => {
  return multer({
    storage: multerCloudinaryStorage(dirname),
    limits: { fileSize: 10485760 },
  });
};
