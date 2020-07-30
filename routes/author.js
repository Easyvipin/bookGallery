const express = require("express");
const router = express.Router();
const Author = require("../models/author");
/* to get all the authors */
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null || req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    console.log(authors);
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
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    res.redirect("authors");
  } catch {
    res.render("author/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
  }
});
module.exports = router;
