import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

import { IRequest } from '../../shared/interface/request';

const requireAll = require('require-all');
const controllers = requireAll({
  dirname: path.resolve(__dirname, '../controllers'),
  filter: /^(?!base)(.+\.controller)\.(t|j)s$/,
  resolve: (controller: any) => {
    if (typeof controller.default === 'function') {
      return new controller.default();
    }
  },
});

export const generatedRoutes = () => {
  const router = Router();

  router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Bonjour Manda!' });
  });

  Object.keys(controllers).forEach((key) => {
    const controller = controllers[key];
    if (controller.$routes) {
      for (const { method, url, middleware, fnName } of controller.$routes) {
        console.log(`${method}: ${url} -> ${fnName}`);
        (router as any)[method](
          url, ...middleware, (req: IRequest, res: Response, next: NextFunction) => {
            controller[fnName](req, res, next);
          },
        );
      }
    }
  });
  return router;
};

export const allRoutes = controllers;
