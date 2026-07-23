import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import StudyGroup from "../models/studyGroupModel.js";

// --- Posts controllers ---
export const createPost = async (req, res) => {
  try {
    const { title, content, postType, category, tags, courseId, studyGroupId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const post = await Post.create({
      author: req.userId,
      title,
      content,
      postType: postType || "Discussion",
      category: category || "General",
      tags: tags || [],
      course: courseId || null,
      studyGroup: studyGroupId || null
    });

    return res.status(201).json({ message: "Post published successfully", post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create post." });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { postType, studyGroupId, courseId } = req.query;
    const filter = {};
    if (postType) filter.postType = postType;
    if (studyGroupId) filter.studyGroup = studyGroupId;
    if (courseId) filter.course = courseId;

    const posts = await Post.find(filter)
      .populate("author", "name photoUrl role")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50);

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load posts." });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const idx = post.likes.indexOf(req.userId);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    return res.status(200).json({ message: "Post likes updated", likes: post.likes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update like status." });
  }
};

// --- Comments controllers ---
export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content) {
      return res.status(400).json({ message: "Post ID and comment content are required." });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.userId,
      content
    });

    return res.status(201).json({ message: "Comment posted", comment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create comment." });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("author", "name photoUrl role")
      .populate("replies.author", "name photoUrl role")
      .sort({ isCorrectAnswer: -1, createdAt: 1 });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load comments." });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const idx = comment.likes.indexOf(req.userId);
    if (idx > -1) {
      comment.likes.splice(idx, 1);
    } else {
      comment.likes.push(req.userId);
    }
    await comment.save();

    return res.status(200).json({ message: "Comment likes updated", likes: comment.likes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to like comment." });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Reply text is required." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    comment.replies.push({
      author: req.userId,
      content
    });
    await comment.save();

    return res.status(200).json({ message: "Reply added successfully", replies: comment.replies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add reply." });
  }
};

export const markCorrectAnswer = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId).populate("post");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // Verify if requester is the author of the original post
    if (comment.post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Only the post author can mark answers as resolved." });
    }

    comment.isCorrectAnswer = !comment.isCorrectAnswer;
    await comment.save();

    return res.status(200).json({ message: "Answer resolved status updated", isCorrectAnswer: comment.isCorrectAnswer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to mark correct answer." });
  }
};

// --- Study Groups controllers ---
export const createStudyGroup = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Group name is required." });
    }

    const existingGroup = await StudyGroup.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: "Group name is already taken." });
    }

    const group = await StudyGroup.create({
      name,
      description,
      isPrivate: !!isPrivate,
      creator: req.userId,
      members: [req.userId]
    });

    return res.status(201).json({ message: "Study Circle created successfully", group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create study circle." });
  }
};

export const getStudyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("creator", "name photoUrl")
      .sort({ createdAt: -1 });
    return res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to load study circles." });
  }
};

export const joinStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    const idx = group.members.indexOf(req.userId);
    if (idx > -1) {
      group.members.splice(idx, 1);
      await group.save();
      return res.status(200).json({ message: "Left study circle", members: group.members });
    } else {
      group.members.push(req.userId);
      await group.save();
      return res.status(200).json({ message: "Joined study circle", members: group.members });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to join study circle." });
  }
};
