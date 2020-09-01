const mongoose = require('mongoose');
const Cron = require('../../cron');

mongoose.set('useFindAndModify', false);

const options = {
  keepAlive: true,
  connectTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

class db {
  connect(DB_URL) {
    mongoose
      .connect(DB_URL, options)
      .then(async () => {
        console.info(`Successfully connected to ${DB_URL}`);
        new Cron().runAllCron();
      })
      .catch(err => {
        console.error(`There was a db connection error ${err}`);
        process.exit(0);
      });
    mongoose.set('useCreateIndex', true);
    const db = mongoose.connection;
    db.once('disconnected', () => {
      console.error(`Successfully disconnected from ${DB_URL}`);
    });
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.error('dBase connection closed due to app termination');
        process.exit(0);
      });
    });
  }
}

module.exports = db;
