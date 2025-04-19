const Blog = require("../models/Blog");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");

module.exports.allBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("createdBy", "email");
    res.render("blogs/index", { blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
module.exports.viewBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate({
        path: "comments.userId",
        select: "email",
      })
      .populate({
        path: "comments.replies.userId",
        select: "email",
      });
    res.render("blogs/show", { blog });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const blogs = await Blog.find({ createdBy: req.user.id }).populate(
      "createdBy",
      "email"
    );
    res.render("blogs/dashboard", { user, blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.createBlogForm = (req, res) => {
  res.render("blogs/create", { errors: [] });
};

module.exports.createBlog = async (req, res) => {
  const errors = validationResult(req);
  const { title, description } = req.body;
  const image = req.file;

  if (!errors.isEmpty()) {
    if (image) {
      fs.unlink(
        path.join(__dirname, "..", "public", "uploads", image.filename),
        (err) => {
          if (err) console.error("Failed to delete uploaded image:", err);
        }
      );
    }
    return res.render("blogs/create", {
      errors: errors.array(),
    });
  }

  try {
    const newBlog = new Blog({
      title,
      description,
      image: image ? image.filename : null,
      createdBy: req.user.id,
    });

    await newBlog.save();
    res.redirect("/blogs");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to create blog." });
  }
};

module.exports.editBlogForm = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.render("blogs/edit", { blog, errors: [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.editBlog = async (req, res) => {
  const errors = validationResult(req);
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;
  const blogId = req.params.id;

  if (!errors.isEmpty()) {
    if (image) {
      fs.unlink(
        path.join(__dirname, "..", "public", "uploads", image),
        (err) => {
          if (err) console.error("Failed to delete uploaded image:", err);
        }
      );
    }
    const blog = await Blog.findById(blogId);
    return res.render("blogs/edit", {
      errors: errors.array(),
      blog,
    });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).render("error", { message: "Blog not found." });
    }
    if (image && blog.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        blog.image
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete old image:", err);
      });
    }

    blog.title = title;
    blog.description = description;
    if (image) blog.image = image;

    await blog.save();
    res.redirect("/blogs/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to update blog." });
  }
};

module.exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (blog.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        blog.image
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete old image:", err);
      });
    }
    res.redirect("/blogs/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.postComment = async (req, res) => {
  const { comment } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);
    blog.comments.push({ userId: req.user.id, comment });
    await blog.save();
    res.redirect("/blogs/" + blog._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.postReply = async (req, res) => {
  const { reply, commentId } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);
    const comment = blog.comments.id(commentId);
    comment.replies.push({ userId: req.user.id, reply });
    await blog.save();
    res.redirect("/blogs/" + blog._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
