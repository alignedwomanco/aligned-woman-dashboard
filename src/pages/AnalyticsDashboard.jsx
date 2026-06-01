import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Eye, RefreshCw } from "lucide-react";

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics", days],
    queryFn: async () => {
      const response = await base44.functions.invoke("getAnalyticsData", { days });
      return response.data;
    },
  });

  const metrics = [
    {
      label: "Active Users",
      value: data?.totals?.[0] ? parseInt(data.totals[0]).toLocaleString() : "-",
      icon: TrendingUp,
      color: "#4A0E2E",
    },
    {
      label: "Sessions",
      value: data?.totals?.[1] ? parseInt(data.totals[1]).toLocaleString() : "-",
      icon: BarChart3,
      color: "#C4847A",
    },
    {
      label: "Page Views",
      value: data?.totals?.[2] ? parseInt(data.totals[2]).toLocaleString() : "-",
      icon: Eye,
      color: "#A86460",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F3]">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display text-awburg-core">Analytics Dashboard</h1>
            <p className="text-sm text-awrose-deep mt-1">Google Analytics data for the last {days} days</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">
                Error loading analytics: {error.message}. Please ensure Google Analytics is properly configured.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-awburg-core border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <Card key={metric.label} className="border-awrose-light/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-body font-medium text-awburg-core/70">
                      {metric.label}
                    </CardTitle>
                    <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display text-awburg-core">{metric.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Data Table */}
            {data?.rows && data.rows.length > 0 && (
              <Card className="border-awrose-light/30">
                <CardHeader>
                  <CardTitle className="text-awburg-core flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-awrose-light/30">
                          <th className="text-left py-3 px-4 text-sm font-body font-medium text-awburg-core/70">Date</th>
                          <th className="text-right py-3 px-4 text-sm font-body font-medium text-awburg-core/70">Users</th>
                          <th className="text-right py-3 px-4 text-sm font-body font-medium text-awburg-core/70">Sessions</th>
                          <th className="text-right py-3 px-4 text-sm font-body font-medium text-awburg-core/70">Page Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-awrose-light/20 hover:bg-awrose-wash/50">
                            <td className="py-3 px-4 text-sm font-body text-awburg-core">
                              {row.dimensionValues?.[0]?.value || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm font-body text-right text-awburg-core">
                              {parseInt(row.metricValues?.[0]?.value || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-body text-right text-awburg-core">
                              {parseInt(row.metricValues?.[1]?.value || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-body text-right text-awburg-core">
                              {parseInt(row.metricValues?.[2]?.value || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}