require('dotenv').config()
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const {
    NODE_ENV,
    DEV_DATABASE_URL,
    TEST_DATABASE_URL,
    DATABASE_URL
} = process.env;
module.exports = () => {
    var DB_URL;
    if (NODE_ENV == 'development') {
        DB_URL = DEV_DATABASE_URL
    } else if (NODE_ENV == 'test') {
        DB_URL = TEST_DATABASE_URL
    } else if (NODE_ENV == 'prod') {
        DB_URL = DATABASE_URL
    }
    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    }, (err, done) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Database connected');

        }
    })

}