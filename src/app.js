const { generatedRoutes } = require('./app/routes');
const { passport } = require('./setup/passport');
const { readFileSync, writeFileSync } = require('fs');
const { safeLoad } = require('js-yaml');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const _ = require('lodash');
const setupDB = require('./setup/sequelize');
const jobs = require('./app/jobs');
const seeds = require('./db/seeds');
const { errorHandler } = require('./shared/util/app');
const ejs = require('ejs');
const { loadDefinitions, loadPaths, loadModels } = require('./documentations');
const { Notifikator } = require('./app/services/notifikator');
const config = require('../config');

const app = express();
const rootDir = config.get('paths.rootdir');
const isDevOrTest = ['development', 'test'].indexOf(config.get('env')) > -1;
const loggingEnabled = config.get('enableLogging') === 'true';

app.use(cors());
app.use(express.static(`${rootDir}/public`));
app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

if (loggingEnabled) {
  const logType = isDevOrTest ? 'dev' : 'combined';
  // app.use(morgan(logType, { stream: loggerStream }));
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

app.set('views', `${rootDir}/public`);
app.set('view engine', 'pug');

if (config.get('downtimeEnabled') === 'true' && !isDevOrTest) {
  app.use('/api/', (req, res) => {
    res.status(401).json({
      message: 'Not Available: Maintenance Mode Enabled! Please try again later.',
    });
  });
} else {
  app.use('/api/', generatedRoutes());
}

app.get('/swagger.json', (req, res) => {
  const data = {
    paths: loadPaths() || '',
    models: loadModels() || '',
    definitions: loadDefinitions() || '',
  };
  const swaggerTemplate = readFileSync(`${rootDir}/src/documentations/swagger.yaml`, 'utf8');
  const swaggerSchema = ejs.render(swaggerTemplate, data);
  writeFileSync('index.yaml', swaggerSchema);
  res.setHeader('Content-Type', 'application/json');
  res.send(safeLoad(swaggerSchema));
});

app.get('/', (req, res) => res.render('index'));

app.use(errorHandler);
if (config.get('downtimeEnabled') !== 'true') {
  passport();
  setupDB();
  Notifikator.loadServices();
}

// seed the DB
seeds.run();

// register jobs
if (!isDevOrTest) {
  jobs.run();
}

// initialize the webserver
const port = process.env.PORT || 39000;

const server = app.listen(port, async () => {
  console.info(`App listening on port ${port}!`);
});

export default app;
