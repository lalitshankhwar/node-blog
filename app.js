const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const User = require("./models/User");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");

main()
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      res.locals.user = user;
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

app.use("/", authRoutes);
app.use("/blogs", blogRoutes);

app.use((req, res) => {
  // console.error(err.stack);
  res.status(500).render("error", { message: "Internal Server Error" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on ${process.env.PORT}`);
});
