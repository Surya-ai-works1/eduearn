import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createPost,
  getPosts,
  likePost,
  createComment,
  getComments,
  likeComment,
  replyToComment,
  markCorrectAnswer,
  createStudyGroup,
  getStudyGroups,
  joinStudyGroup
} from "../controllers/communityController.js";

const communityRouter = express.Router();

// Posts
communityRouter.post("/post/create", isAuth, createPost);
communityRouter.get("/post/list", isAuth, getPosts);
communityRouter.post("/post/like/:postId", isAuth, likePost);

// Comments
communityRouter.post("/comment/create", isAuth, createComment);
communityRouter.get("/comment/list/:postId", isAuth, getComments);
communityRouter.post("/comment/like/:commentId", isAuth, likeComment);
communityRouter.post("/comment/reply/:commentId", isAuth, replyToComment);
communityRouter.post("/comment/resolve/:commentId", isAuth, markCorrectAnswer);

// Study Groups
communityRouter.post("/group/create", isAuth, createStudyGroup);
communityRouter.get("/group/list", isAuth, getStudyGroups);
communityRouter.post("/group/join/:groupId", isAuth, joinStudyGroup);

export default communityRouter;
