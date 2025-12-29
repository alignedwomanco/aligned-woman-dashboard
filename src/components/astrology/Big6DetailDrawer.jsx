import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Play, Clock, BookOpen } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Big6DetailDrawer({ isOpen, onClose, planetData, courses = [] }) {
  if (!planetData) return null;

  const { planet, sign, whatThisMeans, whenStressed, whenAligned, supportivePractice } = planetData;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">{planet} in {sign}</SheetTitle>
          <p className="text-sm text-gray-600">Understanding your core wiring</p>
        </SheetHeader>

        {/* What This Means */}
        <Card className="mb-6 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">What this means for you</h3>
            <p className="text-gray-700 leading-relaxed">{whatThisMeans}</p>
          </CardContent>
        </Card>

        {/* When Stressed vs When Aligned */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-l-4 border-l-red-400">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-900">When Stressed</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{whenStressed}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-400">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">When Aligned</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{whenAligned}</p>
            </CardContent>
          </Card>
        </div>

        {/* Supportive Practice */}
        <Card className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Supportive Practice</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{supportivePractice}</p>
            <Badge className="bg-purple-100 text-purple-800 border-0">
              Try this today
            </Badge>
          </CardContent>
        </Card>

        {/* Suggested Courses */}
        {courses.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Deepen Your Understanding</h3>
            <div className="space-y-3">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{course.reason || `Perfect for understanding your ${planet}`}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration || "20"} min
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.format || "Video"}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        onClick={() => window.location.href = createPageUrl("ModulePlayer") + `?courseId=${course.id}`}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}