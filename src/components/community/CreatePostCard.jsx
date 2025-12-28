import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Video, Smile, Hash } from "lucide-react";
import { motion } from "framer-motion";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { base44 } from "@/api/base44Client";
import confetti from "canvas-confetti";

export default function CreatePostCard({ currentUser, onPostCreated }) {
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState([]);
  const [hashtags, setHashtags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return file_url;
        })
      );
      setMediaUrls([...mediaUrls, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const hashtagArray = hashtags
        .split(/[\s,]+/)
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.slice(1));

      await onPostCreated({
        content,
        media_urls: mediaUrls,
        hashtags: hashtagArray.length > 0 ? hashtagArray : undefined,
      });

      // Award points for posting
      await awardPoints(10, "post_created");

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Reset form
      setContent("");
      setMediaUrls([]);
      setHashtags("");
    } catch (error) {
      console.error("Post failed:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const awardPoints = async (points, reason) => {
    try {
      const userPoints = await base44.entities.UserPoints.filter({});
      const current = userPoints[0];
      
      if (current) {
        const newTotal = (current.points || 0) + points;
        await base44.entities.UserPoints.update(current.id, {
          points: newTotal,
          level: Math.floor(newTotal / 100) + 1,
        });
      } else {
        await base44.entities.UserPoints.create({
          points,
          level: 1,
        });
      }

      // Update user's community points
      await base44.auth.updateMe({
        total_community_points: ((currentUser.total_community_points || 0) + points),
        last_active_community_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to award points:", error);
    }
  };

  const removeMedia = (index) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={currentUser?.profile_picture} />
          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            {currentUser?.full_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <ReactQuill
            value={content}
            onChange={setContent}
            placeholder={`What's on your mind, ${currentUser?.full_name?.split(' ')[0] || 'there'}?`}
            className="bg-white/5 rounded-lg [&_.ql-editor]:text-white [&_.ql-editor]:min-h-[80px] [&_.ql-toolbar]:border-white/10 [&_.ql-container]:border-white/10"
            modules={{
              toolbar: [
                ["bold", "italic"],
                ["link"],
              ],
            }}
          />

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {mediaUrls.map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative group aspect-square rounded-xl overflow-hidden"
                >
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute top-1 right-1 bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              <input
                id="image-upload"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => document.getElementById('image-upload').click()}
                disabled={isUploading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Image className="w-5 h-5 text-green-400" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Hash className="w-5 h-5 text-purple-400" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Smile className="w-5 h-5 text-yellow-400" />
              </motion.button>
            </div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handlePost}
                disabled={!content.trim() || isPosting}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full px-6"
              >
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}