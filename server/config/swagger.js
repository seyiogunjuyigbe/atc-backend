const  getPets = require('../docss/getPet'); 

const swaggerDocument = {
  openapi: '3.0.1',
  info: {
      version: '1.0.0',
      title: "African Travel Club API", // Title of the documentation
      version: '1.0.0', // Version of the app
      description: 'This is the REST API for my product', // short description of the app
      contact: {
        name: "Afeez Awotundun"
        },
      license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
      },
      servers: [
        {
            url: 'http://localhost:5000/api/v1',
            description: 'Local server'
        },
        {
            url: 'https://app-dev.herokuapp.com/api/v1',
            description: 'DEV Env'
        },
        {
            url: 'https://app-uat.herokuapp.com/api/v1',
            description: 'UAT Env'
        }
    ],
  },
    components: {
      schemas: {},
      securitySchemes: {
          bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
          }
      }
  },
      tags: [
        {
            name: 'Pets'
        }
    ],
    paths: {
        "/pets": {
            "get": getPets
        }
    }
}


module.exports = swaggerDocument;

