const Passport = require('passport');
const { Strategy } = require('passport-local');
const { model: User } = require('../app/models/user');

export const passport = () => {
  Passport.use(
    new Strategy(
      {
        usernameField: 'email',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        const query = { email: email.toLowerCase() };
        try {
          const foundUser = await User.findOne(query);
          if (!foundUser) {
            return done(null, null, ({
              message: 'Invalid email or password.',
              code: 'invalid_login',
            }));
          }

          return foundUser.comparePassword(password, (err, isMatch) => {
            if (err) {
              return done(err);
            }

            if (!isMatch) {
              return done(null, null, ({
                message: 'Invalid email or password.',
                code: 'invalid_login',
              }));
            }

            return done(null, foundUser);
          });
        } catch (err) {
          done(err);
        }
      }),
  );
};
