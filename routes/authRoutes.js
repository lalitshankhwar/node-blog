const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const router = express.Router();
const multer = require("../middlewares/multerConfig");
const redirectIfAuthenticated = require("../middlewares/redirectIfAuthenticated");

router.get("/", authController.home);
router.get("/login", redirectIfAuthenticated, authController.loginForm);
router.post(
  "/login",
  redirectIfAuthenticated,
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.login
);

router.get("/signup", redirectIfAuthenticated, authController.signupForm);

router.post(
  "/signup",
  redirectIfAuthenticated,
  multer.single("profileImage"),
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  authController.signup
);

router.get("/logout", authController.logout);

module.exports = router;
