const { validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

module.exports.home = (req, res) => {
  res.redirect("/blogs");
};
module.exports.loginForm = (req, res) => {
  const success = req.query.success || "";
  res.render("auth/login", { errors: [], success, error: "" });
};

module.exports.login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("/login", { errors: errors.array(), error: "" });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("auth/login", {
        errors: [],
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render("auth/login", {
        errors: [],
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/blogs/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.signupForm = (req, res) => {
  res.render("auth/signup", { errors: [], error: "" });
};

module.exports.signup = async (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  if (!errors.isEmpty()) {
    if (profileImage) {
      fs.unlink(
        path.join(__dirname, "..", "public", "uploads", profileImage),
        (err) => {
          if (err) console.error("Failed to delete uploaded image:", err);
        }
      );
    }
    return res.render("auth/signup", { errors: errors.array(), error: "" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("auth/signup", {
        error: "Email already in use",
        errors: [],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      profileImage: "/uploads/" + profileImage,
    });
    await user.save();
    return res.redirect(
      "/login?success=Account created successfully. Please login."
    );
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/blogs");
};
