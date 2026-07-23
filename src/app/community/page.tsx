"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { lmsHubsDb, Post, Comment, StudyGroup } from "../../lib/lmsHubsDb";
import { toast } from "sonner";
import {
  FaComment,
  FaHeart,
  FaCheckCircle,
  FaPlus,
  FaUsers,
  FaTags,
  FaBookReader,
  FaArrowRight,
  FaUserCircle
} from "react-icons/fa";

export default function CommunityForum() {
  const { user } = useAuth();

  // Active Tab: "feed" | "groups"
  const [activeTab, setActiveTab] = useState("feed");

  // Feed State
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Form State: Create Post
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active Post Comments Dialog / Section
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Study Groups State
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Form State: Create Group
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCategory, setGroupCategory] = useState("Web Development");
  const [submittingGroup, setSubmittingGroup] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const data = await lmsHubsDb.getPosts(user?.id);
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPosts(false);
    }
  }, [user]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const data = await lmsHubsDb.getStudyGroups(user?.id);
      setGroups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGroups(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (activeTab === "groups") {
      fetchGroups();
    }
  }, [activeTab, fetchGroups]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to write posts");
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) return;

    setSubmittingPost(true);
    try {
      const tagsArray = postTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const name = user.fullName || user.email.split("@")[0] || "User";
      await lmsHubsDb.createPost(user.id, name, postTitle, postContent, tagsArray);
      
      toast.success("Post published successfully!");
      setPostTitle("");
      setPostContent("");
      setPostTags("");
      fetchFeed(); // reload
    } catch (err) {
      toast.error("Failed to publish post");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleLike = async (post: Post) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      if (post.has_liked) {
        await lmsHubsDb.unlikePost(user.id, post.id);
        setPosts(
          posts.map((p) =>
            p.id === post.id
              ? { ...p, has_liked: false, likes_count: (p.likes_count || 1) - 1 }
              : p
          )
        );
      } else {
        await lmsHubsDb.likePost(user.id, post.id);
        setPosts(
          posts.map((p) =>
            p.id === post.id
              ? { ...p, has_liked: true, likes_count: (p.likes_count || 0) + 1 }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPost = async (post: Post) => {
    setSelectedPost(post);
    try {
      const postComments = await lmsHubsDb.getComments(post.id);
      setComments(postComments);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost) return;
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const name = user.fullName || user.email.split("@")[0] || "User";
      const created = await lmsHubsDb.createComment(user.id, name, selectedPost.id, newComment);
      setComments([...comments, created]);
      setNewComment("");
      
      // Update comments count in parent listing
      setPosts(
        posts.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      );
      toast.success("Comment published!");
    } catch (e) {
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleMarkCorrect = async (commentId: string) => {
    if (!selectedPost || !user) return;
    if (selectedPost.user_id !== user.id) {
      toast.error("Only the post creator can mark the correct answer");
      return;
    }

    try {
      await lmsHubsDb.markCorrectAnswer(selectedPost.id, commentId);
      setComments(
        comments.map((c) => (c.id === commentId ? { ...c, is_correct: true } : c))
      );
      setSelectedPost({ ...selectedPost, correct_comment_id: commentId });
      toast.success("Correct answer verified!");
    } catch (e) {
      toast.error("Failed to verify answer");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!groupTitle.trim()) return;

    setSubmittingGroup(true);
    try {
      await lmsHubsDb.createStudyGroup(user.id, groupTitle, groupDesc, groupCategory);
      toast.success("Study group created successfully!");
      setGroupTitle("");
      setGroupDesc("");
      fetchGroups();
    } catch (e) {
      toast.error("Failed to create study group");
    } finally {
      setSubmittingGroup(false);
    }
  };

  const handleJoinLeaveGroup = async (group: StudyGroup) => {
    if (!user) {
      toast.error("Please login to join groups");
      return;
    }

    try {
      if (group.is_member) {
        await lmsHubsDb.leaveStudyGroup(user.id, group.id);
        toast.success("Left study group");
      } else {
        await lmsHubsDb.joinStudyGroup(user.id, group.id);
        toast.success("Joined study group successfully!");
      }
      fetchGroups(); // reload member status
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-6 lg:px-10 flex justify-center">
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-border pb-6 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FaUsers className="text-blue-500" /> Community Forums
            </h1>
            <p className="text-xs text-muted-foreground font-light">
              Participate in study squads, verify homework questions, and interact with peers.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="space-y-6">
          <div className="flex border-b border-border text-xs font-semibold text-muted-foreground gap-2">
            <button
              onClick={() => {
                setActiveTab("feed");
                setSelectedPost(null);
              }}
              className={`px-4 py-2 border-b-2 transition ${
                activeTab === "feed" ? "border-blue-500 text-blue-400" : "border-transparent hover:text-white"
              }`}
            >
              Discussion Feed
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-4 py-2 border-b-2 transition ${
                activeTab === "groups" ? "border-blue-500 text-blue-400" : "border-transparent hover:text-white"
              }`}
            >
              Study Squad Groups
            </button>
          </div>

          {/* TAB 1: FEED FORUM */}
          {activeTab === "feed" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Posts List / Comments view */}
              <div className="lg:col-span-2 space-y-6">
                {selectedPost ? (
                  /* SINGLE POST COMMENTS DISCUSSION VIEW */
                  <div className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl p-6 space-y-6 text-left">
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="text-xs text-muted-foreground hover:text-foreground transition"
                    >
                      ← Back to feed listing
                    </button>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80">
                        <FaUserCircle className="text-lg" />
                        <span className="font-bold text-muted-foreground">{selectedPost.user_name}</span>
                        <span>• {new Date(selectedPost.created_at).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-base font-extrabold text-foreground">{selectedPost.title}</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed font-light">{selectedPost.content}</p>
                    </div>

                    {/* Comments list thread */}
                    <div className="border-t border-border/60 pt-6 space-y-4">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Responses</h3>
                      
                      {comments.length === 0 ? (
                        <p className="text-muted-foreground/80 text-xs text-center py-6 font-light">No comments published yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {comments.map((comm) => (
                            <div
                              key={comm.id}
                              className={`p-4 border rounded-xl space-y-2 text-left relative ${
                                comm.is_correct
                                  ? "bg-green-950/10 border-green-500/20"
                                  : "bg-muted/40 border-border"
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px]">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-foreground">{comm.user_name}</span>
                                  {comm.is_correct && (
                                    <span className="text-green-400 flex items-center gap-0.5 font-bold uppercase tracking-wider text-[8px] bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">
                                      <FaCheckCircle /> Solution Verified
                                    </span>
                                  )}
                                </div>
                                <span className="text-muted-foreground/80">{new Date(comm.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-muted-foreground font-light leading-relaxed">{comm.content}</p>
                              
                              {/* Option to mark correct */}
                              {!selectedPost.correct_comment_id && selectedPost.user_id === user?.id && (
                                <button
                                  onClick={() => handleMarkCorrect(comm.id)}
                                  className="text-[9px] text-green-400 hover:underline block pt-1 font-semibold"
                                >
                                  Mark as Correct Solution
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleAddComment} className="flex gap-2 border-t border-border pt-4">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 h-10 bg-background border border-border rounded-lg text-foreground text-xs px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  /* POSTS LIST FEED */
                  <div className="space-y-4">
                    {loadingPosts ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      </div>
                    ) : posts.length === 0 ? (
                      <p className="text-muted-foreground/80 text-xs text-center py-10 font-light">No posts found in feed.</p>
                    ) : (
                      posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-slate-850 rounded-2xl p-5 text-left space-y-4 transition duration-300"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground/80">
                              <div className="flex items-center gap-1.5">
                                <FaUserCircle className="text-base" />
                                <span className="font-bold text-muted-foreground">{post.user_name}</span>
                              </div>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-sm font-extrabold text-foreground leading-snug">{post.title}</h3>
                            <p className="text-xs text-muted-foreground font-light line-clamp-3 leading-relaxed">
                              {post.content}
                            </p>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {post.tags.map((t, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-semibold uppercase tracking-wider rounded">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-6 border-t border-border/60 pt-4 text-muted-foreground text-xs">
                            <button
                              onClick={() => handleToggleLike(post)}
                              className={`flex items-center gap-1.5 transition ${
                                post.has_liked ? "text-red-500" : "hover:text-red-500"
                              }`}
                            >
                              <FaHeart /> <span className="font-mono">{post.likes_count}</span>
                            </button>
                            <button
                              onClick={() => handleSelectPost(post)}
                              className="flex items-center gap-1.5 hover:text-blue-500 transition"
                            >
                              <FaComment /> <span className="font-mono">{post.comments_count}</span>
                            </button>
                            {post.correct_comment_id && (
                              <span className="text-green-400 flex items-center gap-1 font-semibold ml-auto text-[10px]">
                                <FaCheckCircle /> Verified Solution
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Write Post Form */}
              <div className="bg-card p-6 border border-border rounded-2xl space-y-4 text-left shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaPlus className="text-blue-500" /> Publish Post
                </h3>

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Post Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. How does garbage collector work in JS?"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Post Content *</label>
                    <textarea
                      placeholder="Write details about your question..."
                      className="w-full h-24 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. javascript, engine, v8"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    {submittingPost ? "Publishing..." : "Publish Post"}
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: STUDY SQUAD GROUPS */}
          {activeTab === "groups" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Groups grid */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Study Squads</h3>

                {loadingGroups ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : groups.length === 0 ? (
                  <p className="text-muted-foreground/80 text-xs text-center py-10 font-light">No study groups formed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 p-5 rounded-2xl text-left flex flex-col justify-between items-start gap-4 hover:border-border transition duration-300"
                      >
                        <div className="space-y-1.5 w-full">
                          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold uppercase rounded">
                            {group.category}
                          </span>
                          <h4 className="text-xs font-bold text-foreground truncate w-full">{group.title}</h4>
                          <p className="text-[10px] text-muted-foreground font-light line-clamp-2 leading-relaxed">
                            {group.description}
                          </p>
                          <span className="text-[9px] text-muted-foreground block font-medium">Members: {group.members_count || 1}</span>
                        </div>

                        <button
                          onClick={() => handleJoinLeaveGroup(group)}
                          className={`w-full py-2 text-xs font-bold rounded-lg transition border ${
                            group.is_member
                              ? "bg-slate-950 border-border text-muted-foreground hover:text-white"
                              : "bg-blue-600 border-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/5"
                          }`}
                        >
                          {group.is_member ? "Leave Squad" : "Join Squad"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Group Form */}
              <div className="bg-card p-6 border border-border rounded-2xl space-y-4 text-left shadow-sm">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FaPlus className="text-blue-500" /> Create Squad
                </h3>

                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Squad Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. JEE Advanced Physics Preparation"
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Subject Category</label>
                    <select
                      className="w-full h-10 bg-background border border-border rounded-lg text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={groupCategory}
                      onChange={(e) => setGroupCategory(e.target.value)}
                    >
                      {["Web Development", "AI/ML", "AI Tools", "Data Science", "Ethical Hacking", "Others"].map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Syllabus Description</label>
                    <textarea
                      placeholder="e.g. Coordinating textbook questions daily..."
                      className="w-full h-16 bg-background border border-border rounded-lg text-foreground text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
                    {submittingGroup ? "Creating..." : "Create Study Squad"}
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
