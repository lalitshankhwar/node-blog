const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, required: true },
    replies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reply: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", blogSchema);
