import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Upload } from "lucide-react";

export default function PageEditor({ open, onOpenChange, page, moduleId }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    videoUrl: "",
    requireCompletion: false,
    estimatedMinutes: 0,
    order: 0,
    moduleId: moduleId || "",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (page) {
      setFormData(page);
    } else {
      setFormData({
        title: "",
        content: "",
        videoUrl: "",
        requireCompletion: false,
        estimatedMinutes: 0,
        order: 0,
        moduleId: moduleId || "",
      });
    }
  }, [page, open, moduleId]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (page) {
        return base44.entities.ModulePage.update(page.id, data);
      } else {
        return base44.entities.ModulePage.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["modulePages"]);
      onOpenChange(false);
    },
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, videoUrl: file_url });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "strike"],
      ["code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote"],
      ["link", "image", "video"],
    ],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{page ? "Edit Page" : "Add Page"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Page Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Module 1. Nervous System Regulation"
            />
          </div>

          <div>
            <Label>Video (optional)</Label>
            <div className="mt-2">
              {formData.videoUrl && (
                <video
                  src={formData.videoUrl}
                  controls
                  className="w-full h-64 rounded-lg mb-2"
                />
              )}
              <div className="flex gap-2">
                <Input
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="Video URL or upload..."
                  className="flex-1"
                />
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border">
                    <Upload className="w-4 h-4 text-[#6B1B3D]" />
                  </div>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label>Content</Label>
            <div className="mt-2 bg-white rounded-lg border">
              <ReactQuill
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                modules={modules}
                theme="snow"
                placeholder="Write your lesson content here..."
                className="h-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-16">
            <div>
              <Label>Estimated Minutes</Label>
              <Input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedMinutes: parseInt(e.target.value),
                  })
                }
                min={0}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Require Completion</Label>
                <p className="text-xs text-gray-600">Must complete before next</p>
              </div>
              <Switch
                checked={formData.requireCompletion}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requireCompletion: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Published</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate(formData)}
                disabled={!formData.title}
                className="bg-[#6B1B3D] hover:bg-[#4A1228]"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}