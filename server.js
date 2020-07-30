if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express(); //creating an instance of express server
const expressLayouts = require("express-ejs-layouts");
const indexRouter = require("./routes/index"); // index router
const authorRouter = require("./routes/author"); // author router
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(express.static("public"));
app.use("/", indexRouter);
app.use("/authors", authorRouter);

/* mongoose connection */
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => {
  console.error(error);
});
db.once("open", () => {
  console.log("connected");
});

app.listen(process.env.PORT, () => {
  console.log("listening to 3000");
});
