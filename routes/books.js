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
/* view a book  */

router.get("/:bookId", async (req, res) => {
  try {
    const eachBook = await Book.findById(req.params.bookId)
      .populate("author")
      .exec();

    res.render("book/show", { book: eachBook });
  } catch {
    res.redirect("/");
  }
});

/* edit page of book */
router.get("/:bookId/edit", async (req, res) => {
  console.log("hello");
  try {
    const book = await Book.findById(req.params.bookId);
    createEditPage(res, book); // generate edit form page from createFormpage
  } catch (err) {
    console.error(err);
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
    res.redirect("books");
  } catch {
    createNewPage(res, new Book(), true);
  }
});

/* update a book */

router.put("/:bookId", async (req, res) => {
  let book;
  try {
    const author = await Author.find({});
    book = await Book.findById(req.params.bookId);
    console.log(req.body.name);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (book.cover != null && res.body.cover != "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${req.params.bookId}`);
  } catch {
    if (book == null) {
      res.redirect("/");
    } else {
      res.render("book/edit", {
        book: book,
        authors: author,
        errorMessage: "Error updating Book",
      });
    }
  }
});

/* delete a book */

router.delete("/:bookId", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.bookId);
    await book.remove();
    res.redirect(`/books`);
  } catch {
    if (book == null) {
      res.redirect("/books");
    } else {
      res.redirect(`/`);
    }
  }
});
async function createNewPage(res, book, hasError = false) {
  createFormPage(res, book, "new", hasError);
}
async function createEditPage(res, book, hasError = false) {
  createFormPage(res, book, "edit", hasError);
}
async function createFormPage(res, book, form, hasError) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError == true) params.errorMessage = "Error in creating the book"; // checking for error in the page
    res.render(`book/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

/* save cover  */

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;

  const cover = JSON.parse(coverEncoded); // its a json file contain the information about the image

  if (cover != null && imageMimeType.includes(cover.type))
    book.coverImage = new Buffer.from(cover.data, "base64"); // converting the base64 encoded data into buffer
  book.coverImageType = cover.type; // cover type
}

module.exports = router;
