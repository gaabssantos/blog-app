const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("../models/User");
const User = mongoose.model("users");

module.exports = function (passport) {
  passport.use(
    new localStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        User.findOne({ email: email }).then((user) => {
          if (!user) {
            return done(null, false, { message: "Esta conta não existe!" });
          }

          bcrypt.compare(password, user.password, (err, check) => {
            if (check) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Senha incorreta!" });
            }
          });
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id }).then((user) => {
      return done(null, user);
    });
  });
};
