const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
/* to get all the authors */
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null || req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("author/index", {
      authors: authors,
      searchOptions: req.query.name,
    });
  } catch {
    res.redirect("/");
  }
});
/* new author */

router.get("/new", (req, res) => {
  res.render("author/new", { author: new Author() });
});

// handle post request
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`/authors/${newAuthor.id}`);
  } catch {
    res.render("author/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});

/* handle view author */
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: req.params.id }).limit(6).exec();
    res.render("author/authorView", {
      author: author,
      booksByAuthor: books,
    });
  } catch {
    res.redirect("/");
  }
});

/* handle edit author */
router.get("/edit/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("author/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});

/* handle update author */
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${req.params.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("author/edit", {
        author: author,
        errorMessage: "Error updating Author",
      });
    }
  }
});

/* handle delete author */
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect(`/authors`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors`);
    }
  }
});
module.exports = router;
