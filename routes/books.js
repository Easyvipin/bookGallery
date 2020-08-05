const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeType = ["image/jpeg", "image/png", "image/gif"];

/* to get all the books */
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishAfter != null && req.query.publishAfter != "") {
    query = query.gte("publishDate", req.query.publishAfter);
  }
  if (req.query.publishBefore != null && req.query.publishBefore != "") {
    query = query.lte("publishDate", req.query.publishBefore);
  }
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  try {
    const books = await query.exec();
    res.render("book/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});
/* Add a new book */
router.get("/new", async (req, res) => {
  try {
    createNewPage(res, new Book());
  } catch {
    res.redirect("/books");
  }
});
// handle the post request
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);
  try {
    const newBook = await book.save(); // saving the book document that was just created
    console.log(newBook);
    res.redirect("books");
  } catch {
    createNewPage(res, new Book(), true);
  }
});
async function createNewPage(res, book, hasError = false) {
  const authors = await Author.find({});
  const params = {
    authors: authors,
    book: book,
  };
  if (hasError == true) params.errorMessage = "Error in creating the book"; // checking for error in the page
  res.render("book/new", params);
}

function saveCover(book, coverEncoded) {
  console.log("hello");
  if (coverEncoded == null) return;
  console.log(coverEncoded);
  const cover = JSON.parse(coverEncoded);
  console.log(cover);
  if (cover != null && imageMimeType.includes(cover.type))
    book.coverImage = new Buffer.from(cover.data, "base64");
  book.coverImageType = cover.type;
}

module.exports = router;
