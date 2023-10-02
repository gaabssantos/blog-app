const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const users = require("./routes/user");
const path = require("path");
const { default: mongoose, mongo } = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Post");
const Post = mongoose.model("posts");
require("./models/Category");
const Category = mongoose.model("categories");
const passport = require("passport");
require("./config/auth.js")(passport);
const db = require("./config/db");

// Sessão
app.use(
  session({
    secret: "node",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Middleware
app.use((req, res, next) => {
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");

// Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect(db.mongoURI)
  .then(() => {
    console.log("Connected to Mongo!");
  })
  .catch((err) => {
    console.log(`Error: ${err}.`);
  });

// Public
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  Post.find()
    .populate("category")
    .sort({ date: "desc" })
    .then((posts) => {
      res.render("index", { posts: posts });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao carregar os posts!");
      res.redirect("/404");
    });
});

app.get("/post/:slug", (req, res) => {
  Post.find({ slug: req.params.slug })
    .then((post) => {
      if (post) {
        res.render("post/index", { post: post });
      } else {
        req.flash("error_message", "Esta postagem não existe!");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao listar a postagem.");
      res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
  Category.find()
    .then((categories) => {
      res.render("categories/index", { categories: categories });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao listar as categorias.");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Category.findOne({ slug: req.params.slug })
    .then((category) => {
      if (category) {
        Post.find({ category: category._id })
          .then((posts) => {
            res.render("categories/posts", {
              posts: posts,
              category: category,
            });
          })
          .catch((err) => {
            req.flash("error_message", "Houve um erro ao listar os posts!");
            res.redirect("/");
          });
      } else {
        req.flash("error_message", "Esta categoria não existe.");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_message",
        "Houve um erro ao listar a página desta categoria."
      );
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("Error 404!");
});

app.use("/admin", admin);
app.use("/usuarios", users);

// Others
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server is running!");
});
