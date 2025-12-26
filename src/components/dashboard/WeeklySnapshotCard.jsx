import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WeeklySnapshotCard({ diagnosticSession }) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
      <CardHeader>
        <CardTitle className="text-2xl">This Week's Overview</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        <p className="text-gray-700 whitespace-pre-line">
          {diagnosticSession.weeklySnapshotSummary || "Your weekly overview will appear here after your first check-in cycle completes."}
        </p>
      </CardContent>
    </Card>
  );
}