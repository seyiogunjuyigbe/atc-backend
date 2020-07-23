require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const morgan = require('morgan');
<<<<<<< HEAD

const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();




=======
const { safeLoad } = require('js-yaml');
const { readFileSync } = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
>>>>>>> 4f86bb52e9a66d29c13944c5fb4fed23c6c6db33

const app = express();
const PORT = process.env.PORT || 3000;


const { loadDefinitions, loadPaths } = require('../documentations');


app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//log every request to the database
app.use(morgan('dev'));
<<<<<<< HEAD
app.use(express.static(pathToSwaggerUi));

app.get("/", (req, res) => {
  res.status(200).send({
    message: `API is alive and kickin - check.`
  });
});
=======

app.set('views', path.join(__dirname, '../public'));
app.set('view engine', 'pug');
>>>>>>> 4f86bb52e9a66d29c13944c5fb4fed23c6c6db33

app.use("/api/v1/", require("./routes/index"));

app.get('/swagger.json', (req, res) => {
  const data = {
    paths: loadPaths() || '',
    definitions: loadDefinitions() || '',
  };
  const swaggerTemplate = readFileSync(path.join(__dirname, '../documentations/swagger.yaml'), 'utf8');
  const swaggerSchema = ejs.render(swaggerTemplate, data);

  res.setHeader('Content-Type', 'application/json');
  res.send(safeLoad(swaggerSchema));
});

app.get('/', (req, res) => res.render('index'));

//error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
