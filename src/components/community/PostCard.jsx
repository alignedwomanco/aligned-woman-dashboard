import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Trash2, 
  Send,
  MoreHorizontal,
  Flag,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from "@/utils";
import moment from "moment";

export default function PostCard({
  post,
  currentUser,
  author,
  isLiked,
  comments,
  onLike,
  onComment,
  onDelete,
  onShare,
  getUserByEmail,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const isAdmin = currentUser && ["admin", "master_admin", "moderator"].includes(currentUser.role);
  const isAuthor = post.created_by === currentUser?.email;

  const handleComment = () => {
    if (commentText.trim()) {
      onComment({ postId: post.id, content: commentText, parentCommentId: replyingTo });
      setCommentText("");
      setReplyingTo(null);
    }
  };

  const getReplies = (commentId) => {
    return comments.filter(c => c.parentCommentId === commentId);
  };

  const topLevelComments = comments.filter(c => !c.parentCommentId);

  return (
    <div className="border-b border-white/5 bg-black">
      <div className="p-4">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-3 flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar 
                  className="w-10 h-10 cursor-pointer ring-2 ring-purple-500/30" 
                  onClick={() => window.location.href = createPageUrl("Members") + `?user=${author?.email}`}
                >
                  <AvatarImage src={author?.profile_picture} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    {author?.full_name?.[0] || post.created_by[0]}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p 
                    className="font-semibold text-white hover:text-purple-400 cursor-pointer transition-colors"
                    onClick={() => window.location.href = createPageUrl("Members") + `?user=${author?.email}`}
                  >
                    {author?.full_name || "Anonymous User"}
                  </p>
                  {author?.level && author.level > 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold">
                        ⚡ L{author.level}
                      </Badge>
                    </motion.div>
                  )}
                  {author?.role && ["admin", "expert", "moderator"].includes(author.role) && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      ✓ {author.role}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                  <span>{moment(post.created_date).fromNow()}</span>
                  {post.reshared_from_post_id && (
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      Reshared
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                {(isAdmin || isAuthor) && (
                  <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-white">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Post
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            <div
              className="prose prose-sm max-w-none mb-3 text-white [&_p]:text-white [&_strong]:text-white [&_em]:text-white"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Media Gallery */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className={`grid gap-2 rounded-xl overflow-hidden ${
                post.media_urls.length === 1 ? 'grid-cols-1' :
                post.media_urls.length === 2 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {post.media_urls.slice(0, 4).map((url, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100">
                    <img 
                      src={url} 
                      alt={`Media ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                    {idx === 3 && post.media_urls.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                        +{post.media_urls.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.hashtags.map((tag, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="text-sm text-purple-400 hover:text-pink-400 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => onLike(post.id)}
                className="flex items-center gap-2 group"
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-6 h-6 transition-all ${
                    isLiked 
                      ? "fill-pink-500 text-pink-500" 
                      : "text-white/70 group-hover:text-pink-500"
                  }`} />
                </motion.div>
                {post.likes > 0 && (
                  <span className="text-sm text-white/70">{post.likes}</span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 group"
              >
                <MessageSquare className="w-6 h-6 text-white/70 group-hover:text-blue-400 transition-colors" />
                {post.commentCount > 0 && (
                  <span className="text-sm text-white/70">{post.commentCount}</span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => onShare(post)}
                className="flex items-center gap-2 group"
              >
                <Share2 className="w-6 h-6 text-white/70 group-hover:text-green-400 transition-colors" />
                {post.shareCount > 0 && (
                  <span className="text-sm text-white/70">{post.shareCount}</span>
                )}
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.8 }}
              className="text-white/70 hover:text-yellow-400 transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t space-y-4"
              >
                {/* Comment Input */}
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser?.profile_picture} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs">
                      {currentUser?.full_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                      className="min-h-[60px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment();
                        }
                      }}
                    />
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={handleComment}
                        disabled={!commentText.trim()}
                        size="icon"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {topLevelComments.map((comment) => {
                    const commentAuthor = getUserByEmail(comment.created_by);
                    const replies = getReplies(comment.id);
                    
                    return (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex gap-3 group">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={commentAuthor?.profile_picture} />
                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                              {commentAuthor?.full_name?.[0] || comment.created_by[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{commentAuthor?.full_name || "Anonymous User"}</p>
                                <span className="text-xs text-gray-500">{moment(comment.created_date).fromNow()}</span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 ml-2">
                              <button className="text-xs text-gray-600 hover:text-[#6B1B3D] font-medium">
                                Like {comment.likes > 0 && `(${comment.likes})`}
                              </button>
                              <button 
                                onClick={() => setReplyingTo(comment.id)}
                                className="text-xs text-gray-600 hover:text-[#6B1B3D] font-medium"
                              >
                                Reply
                              </button>
                            </div>

                            {/* Nested Replies */}
                            {replies.length > 0 && (
                              <div className="ml-6 mt-3 space-y-2">
                                {replies.map((reply) => {
                                  const replyAuthor = getUserByEmail(reply.created_by);
                                  return (
                                    <div key={reply.id} className="flex gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={replyAuthor?.profile_picture} />
                                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                          {replyAuthor?.full_name?.[0] || reply.created_by[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xs font-medium">{replyAuthor?.full_name || "Anonymous User"}</p>
                                            <span className="text-xs text-gray-500">{moment(reply.created_date).fromNow()}</span>
                                          </div>
                                          <p className="text-xs text-gray-700">{reply.content}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}