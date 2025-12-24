import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";

export default function SectionEditor({ open, onOpenChange, section }) {
  const [formData, setFormData] = useState({
    name: "",
    phase: "Awareness",
    description: "",
    order: 0,
    coverImage: "",
    accessType: "open",
    accessLevel: 1,
    isPublished: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (section) {
      setFormData(section);
    } else {
      setFormData({
        name: "",
        phase: "Awareness",
        description: "",
        order: 0,
        coverImage: "",
        accessType: "open",
        accessLevel: 1,
        isPublished: true,
      });
    }
  }, [section, open]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (section) {
        return base44.entities.Section.update(section.id, data);
      } else {
        return base44.entities.Section.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sections"]);
      onOpenChange(false);
    },
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, coverImage: file_url });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "Create Section"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Section Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., A - Awareness"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length} / 50</p>
          </div>

          <div>
            <Label>Phase</Label>
            <Select
              value={formData.phase}
              onValueChange={(value) => setFormData({ ...formData, phase: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Awareness">Awareness</SelectItem>
                <SelectItem value="Liberation">Liberation</SelectItem>
                <SelectItem value="Intention">Intention</SelectItem>
                <SelectItem value="VisionEmbodiment">Vision & Embodiment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Section description..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length} / 500</p>
          </div>

          <div>
            <Label>Access Type</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[
                { value: "open", label: "Open" },
                { value: "level_unlock", label: "Level Unlock" },
                { value: "buy_now", label: "Buy Now" },
                { value: "time_unlock", label: "Time Unlock" },
                { value: "private", label: "Private" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData({ ...formData, accessType: type.value })}
                  className={`p-3 rounded-lg border-2 text-sm transition-all ${
                    formData.accessType === type.value
                      ? "border-[#6B1B3D] bg-pink-50"
                      : "border-gray-200 hover:border-pink-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {formData.accessType === "level_unlock" && (
            <div>
              <Label>Access Level</Label>
              <Input
                type="number"
                value={formData.accessLevel}
                onChange={(e) =>
                  setFormData({ ...formData, accessLevel: parseInt(e.target.value) })
                }
                min={1}
              />
            </div>
          )}

          <div>
            <Label>Cover Image</Label>
            <div className="mt-2">
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
              )}
              <Label htmlFor="cover-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border-2 border-dashed border-pink-200 justify-center">
                  <Upload className="w-4 h-4 text-[#6B1B3D]" />
                  <span className="text-sm font-medium text-[#6B1B3D]">
                    {formData.coverImage ? "Change Cover" : "Upload Cover"}
                  </span>
                </div>
                <Input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </Label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Published</Label>
              <p className="text-sm text-gray-600">Make this section visible to users</p>
            </div>
            <Switch
              checked={formData.isPublished}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublished: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.name}
              className="bg-[#6B1B3D] hover:bg-[#4A1228]"
            >
              {section ? "Save Changes" : "Create Section"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}