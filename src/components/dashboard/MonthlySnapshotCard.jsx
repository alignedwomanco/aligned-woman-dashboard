import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonthlySnapshotCard({ diagnosticSession }) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
      <CardHeader>
        <CardTitle className="text-2xl">This Month's Reflection</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        <p className="text-gray-700 whitespace-pre-line">
          {diagnosticSession.monthlySnapshotSummary || "Your monthly reflection will appear here as you progress through your journey."}
        </p>
      </CardContent>
    </Card>
  );
}