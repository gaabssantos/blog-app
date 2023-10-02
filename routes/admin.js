const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category");
const Category = mongoose.model("categories");
require("../models/Post");
const Post = mongoose.model("posts");
const { isAdmin } = require("../helpers/isAdmin");

router.get("/", isAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/categorias", isAdmin, (req, res) => {
  Category.find()
    .sort({ date: "desc" })
    .then((categories) => {
      res.render("admin/categorias", { categories: categories });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao listar as categorias!");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", isAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", isAdmin, (req, res) => {
  var errors = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    errors.push({ texto: "Nome inválido" });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    errors.push({ texto: "Slug inválido" });
  }

  if (errors.length > 0) {
    res.render("admin/addcategorias", { errors: errors });
  }

  const newCategory = {
    name: req.body.name,
    slug: req.body.slug,
  };

  new Category(newCategory)
    .save()
    .then(() => {
      req.flash("succes_message", "Categoria criada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_message", "Erro ao salvar a categoria!");
      res.redirect("/admin");
    });
});

router.get("/categorias/edit/:id", isAdmin, (req, res) => {
  Category.findOne({ _id: req.params.id })
    .then((category) => {
      res.render("admin/editcategorias", { category: category });
    })
    .catch((err) => {
      req.flash("error_message", "Esta categoria não existe!");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", isAdmin, (req, res) => {
  Category.findOne({ _id: req.body.id })
    .then((category) => {
      if (req.body.name === category.name && req.body.slug === category.slug) {
        req.flash(
          "error_message",
          "O nome que você quer editar é o mesmo atual!"
        );
        res.redirect("/admin/categorias");
        return;
      }

      if (req.body.name === "" || req.body.slug === "") {
        req.flash("error_message", "É necessário preencher todos os campos!");
        res.redirect("/admin/categorias");
        return;
      }

      category.name = req.body.name;
      category.slug = req.body.slug;

      category
        .save()
        .then(() => {
          req.flash("success_message", "Categoria editada com sucesso!");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_message",
            "Houve um erro interno ao salvar a edição da categoria."
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao editar a categoria.");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", isAdmin, (req, res) => {
  Category.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_message", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao deletar a categoria.");
      res.redirect("/admin/categorias");
    });
});

router.get("/posts", isAdmin, (req, res) => {
  Post.find()
    .populate("category")
    .sort({ date: "desc" })
    .then((posts) => {
      res.render("admin/posts", { posts: posts });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao listar todas as postagens!");
      console.log(err);
      res.redirect("/admin");
    });
});

router.get("/posts/add", isAdmin, (req, res) => {
  Category.find()
    .then((categories) => {
      res.render("admin/addpostagem", { categories: categories });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao carregar o formulário.");
      res.redirect("/admin");
    });
});

router.post("/posts/nova", isAdmin, (req, res) => {
  var errors = [];
  if (req.body.category == "0") {
    errors.push({ text: "Categoria inválida, registre uma categoria" });
  }

  if (errors.length > 0) {
    res.render("admin/addpostagem", { errors: errors });
  } else {
    const newPost = {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
      slug: req.body.slug,
    };

    new Post(newPost)
      .save()
      .then(() => {
        req.flash("success_message", "Postagem criada com sucesso!");
        res.redirect("/admin/posts");
      })
      .catch((err) => {
        req.flash("error_message", "Houve um erro ao criar a postagem.");
        res.redirect("/admin/posts");
      });
  }
});

router.get("/posts/edit/:id", isAdmin, (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      Category.find().then((categories) => {
        res.render("admin/editposts", { categories: categories, post: post });
      });
    })
    .catch((err) => {
      req.flash(
        "error_message",
        "Houve um erro ao carregar o formulário de edição."
      );
      res.redirect("/admin/posts");
    });
});

router.post("/post/edit", isAdmin, (req, res) => {
  Post.findOne({ _id: req.body.id })
    .then((post) => {
      post.title = req.body.title;
      post.slug = req.body.slug;
      post.description = req.body.description;
      post.content = req.body.content;
      req.category = req.body.category;

      post
        .save()
        .then(() => {
          req.flash("success_message", "Postagem editada com sucesso!");
          res.redirect("/admin/posts");
        })
        .catch((err) => {
          req.flash("error_message", "Houve algum erro ao editar a postagem.");
        });
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao salvar a edição.");
      res.redirect("/admin/posts");
    });
});

router.get("/posts/deletar/:id", isAdmin, (req, res) => {
  Post.deleteOne({ _id: req.params.id })
    .then((post) => {
      req.flash("success_message", "Postagem deletada com sucesso.");
      res.redirect("/admin/posts");
    })
    .catch((err) => {
      req.flash("error_message", "Houve um erro ao deletar a postagem.");
      res.redirect("/admin/posts");
    });
});

module.exports = router;
