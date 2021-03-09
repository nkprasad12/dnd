import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import {PassportStatic} from 'passport';
import passportLocal from 'passport-local';

import {checkDefined} from '_common/preconditions';

// Deferring instatiation for tests.
function sessionOptions(): session.SessionOptions {
  return {
    secret: checkDefined(process.env.SECRET_KEY),
    resave: false,
    saveUninitialized: false,
  };
}

function localStrategy(): passportLocal.Strategy {
  return new passportLocal.Strategy((username, password, done) => {
    if (username !== process.env.ADMIN_USER) {
      return done(null, false);
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return done(null, false);
    }
    return done(null, {id: username});
  });
}

export function setupLogin(
  app: express.Express,
  passport: PassportStatic
): void {
  app.use(session(sessionOptions()));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(localStrategy());
  // @ts-ignore
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, {id: id}));
}
