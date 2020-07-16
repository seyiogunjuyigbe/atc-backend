import * as path from 'path';
const requireAll = require('require-all');

export default {
  run: () => {
    console.log('======= JOBS ========');
    requireAll({
      dirname: path.resolve(__dirname, './'),
      filter: /^(?!index)(.+)\.(t|j)s$/,
      resolve: (job) => {
        if (typeof job.default === 'function') {
          return job.default();
        }
      },
    });
    console.log('======= **** ========');
  },
};
