import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ExternalLink } from "lucide-react";

export default function CourseAccessGate({ course, onPreview }) {
  return (
    <Card className="border-2 border-amber-200 bg-amber-50">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Premium Course</h3>
          <p className="text-sm text-gray-600">
            Purchase this course to unlock all lessons, tools, and resources.
          </p>
        </div>
        {course?.price > 0 && (
          <p className="text-2xl font-bold text-[#6E1D40]">
            ${course.price}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://alignedwomanco.com/blueprint"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-[#6E1D40] hover:bg-[#5A1633] text-white gap-2">
              <ExternalLink className="w-4 h-4" />
              Purchase Course
            </Button>
          </a>
          {onPreview && (
            <Button variant="outline" onClick={onPreview}>
              Preview Lessons
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}