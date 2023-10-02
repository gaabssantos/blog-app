const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("users");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registro", (req, res) => {
  res.render("users/register");
});

router.post("/registro", (req, res) => {
  var errors = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    errors.push({ text: "Nome inválido." });
  }

  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    errors.push({ text: "E-mail inválido." });
  }

  if (
    !req.body.password ||
    typeof req.body.password == undefined ||
    req.body.password == null
  ) {
    errors.push({ text: "Senha inválida." });
  }

  if (req.body.password.length < 4) {
    errors.push({ text: "Senha muito curta." });
  }

  if (req.body.password != req.body.password2) {
    errors.push({ text: "Senhas são diferentes." });
  }

  if (errors.length > 0) {
    res.render("users/register", { errors: errors });
  } else {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          req.flash(
            "error_message",
            "Já existe um usuário registrado com este e-mail."
          );
          res.redirect("/usuarios/registro");
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                req.flash(
                  "error_message",
                  "Houve um erro ao salvar o usuário."
                );
                res.redirect("/");
              }

              newUser.password = hash;

              newUser
                .save()
                .then(() => {
                  req.flash(
                    "success_message",
                    "Usuário cadastrado com sucesso."
                  );
                  res.redirect("/");
                })
                .catch((err) => {
                  req.flash(
                    "error_message",
                    "Houve um erro ao cadastrar o usuário."
                  );
                  res.redirect("/usuarios/registro");
                });
            });
          });
        }
      })
      .catch((err) => {
        req.flash("error_message", "Houve um erro ao encontrar um usuário.");
      });
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success_message", "Você saiu do sistema com sucesso.");
    res.redirect("/");
  });
});

module.exports = router;
