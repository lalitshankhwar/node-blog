const express = require("express");
const blogController = require("../controllers/blogController");
const isAuthenticated = require("../middlewares/isAuthenticated");
const multer = require("../middlewares/multerConfig");
const { body } = require("express-validator");
const router = express.Router();

router.get("/", blogController.allBlogs);
router.get("/dashboard", isAuthenticated, blogController.dashboard);
router.get("/create", isAuthenticated, blogController.createBlogForm);
router.post(
  "/create",
  isAuthenticated,
  multer.single("image"),
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required.")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters."),
    body("description")
      .notEmpty()
      .withMessage("Description is required.")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),
  ],
  blogController.createBlog
);

router.get("/edit/:id", isAuthenticated, blogController.editBlogForm);
router.post(
  "/edit/:id",
  isAuthenticated,
  multer.single("image"),
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required.")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters."),
    body("description")
      .notEmpty()
      .withMessage("Description is required.")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),
  ],
  blogController.editBlog
);

router.get("/delete/:id", isAuthenticated, blogController.deleteBlog);

router.post("/:id/comment", isAuthenticated, blogController.postComment);
router.post("/:id/reply", isAuthenticated, blogController.postReply);
router.get("/:id", blogController.viewBlog);

module.exports = router;
