const express = require("express");
const router = express.Router();
const fs = require("fs");
const Book = require("../models/book");
const Author = require("../models/author");
const path = require("path");
const uploadPath = path.join("public", Book.bookCoverBasePath);
const multer = require("multer");
const { isRegExp } = require("util");
const imageMimeType = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeType.includes(file.mimetype));
  },
});

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
router.post("/", upload.single("cover"), async (req, res) => {
  const filename = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: filename,
    description: req.body.description,
  });
  try {
    const newBook = await book.save();
    console.log(newBook);
    res.redirect("books");
  } catch {
    if (book.coverImageName !== null) {
      removeCover(book.coverImageName);
    }
    createNewPage(res, new Book(), true);
  }
});
async function createNewPage(res, book, hasError = false) {
  const authors = await Author.find({});
  const params = {
    authors: authors,
    book: book,
  };
  if (hasError == true) params.errorMessage = "Error in creating the book";
  res.render("book/new", params);
}
function removeCover(filename) {
  console.log(uploadPath);
  fs.unlink(path.join(uploadPath, filename), (err) => {
    console.error(err);
  });
}
module.exports = router;