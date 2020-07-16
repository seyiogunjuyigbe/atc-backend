const path = require('path');
const requireAll = require('require-all');

export default {
  run: () => {
    requireAll({
      dirname: path.resolve(__dirname, './'),
      filter: /^(?!index)(.+)\.(t|j)s$/,
      resolve: (seeder) => {
        if (typeof seeder.default === 'function') {
          return seeder.default();
        }
      },
    });
  },
};
