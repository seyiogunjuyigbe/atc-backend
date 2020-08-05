const Passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const FacebookTokenStrategy = require('passport-facebook-token');
const { Strategy: GoogleTokenStrategy } = require('passport-google-token');
const { User } = require('../models');

exports.passport = () => {
  // Default login with email/password
  Passport.use(
    new LocalStrategy(
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

  // Login with Google OAuth
  Passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
    async function (accessToken, refreshToken, profile, done) {
      console.log({ accessToken, refreshToken, profile });
      try {
        const foundUser = await User.findOne({
          googleId: profile.id,
        });

        if (foundUser) {
          return done(null, foundUser);
        }

        const newUser = await User.create({
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
        });

        return done(null, newUser);
      } catch (error) {
        return done(err);
      }
    }
  ));

  // Login with Facebook OAuth
  Passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  },
    async function (accessToken, refreshToken, profile, done) {
      console.log({ accessToken, refreshToken, profile });
      try {
        const foundUser = await User.findOne({
          facebookId: profile.id,
        });

        if (foundUser) {
          return done(null, foundUser);
        }

        const newUser = await User.create({
          facebookId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
        });

        return done(null, newUser);
      } catch (error) {
        return done(err);
      }
    }
  ));
};
