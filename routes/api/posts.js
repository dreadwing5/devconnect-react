const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

//@route    Post api/posts
//@desc     Create a Post
//@access   Private

router.post(
  "/",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    Get api/posts
//@desc     Get all posts
//@access   Private

router.get("/", auth, async (req, res) => {
  try {
    //Sort by most recent date
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    Get api/posts/:id
//@desc     Get post by Id
//@access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    //Sort by most recent date
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    Delete api/posts/:id
//@desc     Delete post by Id
//@access   Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    Put api/posts/like/:id
//@desc     Like a post
//@access   Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //Check if post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "post has already been liked" });
    }
    //Push the user to the beginning of array
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    Put api/posts/unlike/:id
//@desc     Unlike a post
//@access   Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //Check if user that liked exist or not
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post hasn't yet been liked" });
    }
    //find the like amd remove it from the array
    const removeIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user.id
    );
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    Post api/posts/comments/:id
//@desc     add a comment to a post
//@access   Private

router.post(
  "/comment/:id",
  auth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    Delete api/posts/comment/:post_id/:id
//@desc     Delete a comment
//@access   Private

router.delete("/comment/:post_id/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //find the comment(from id) from array
    const removeIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === req.params.id
    );

    //Check if comment exist
    if (removeIndex === -1) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    //Check if the comment to be deleted belongs to the user or not

    if (post.comments[removeIndex].user.toString() !== req.user.id) {
      return res.status(400).json({ msg: "user not Authorized" });
    }

    //Delete comment
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "comment not found" });
    }
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
