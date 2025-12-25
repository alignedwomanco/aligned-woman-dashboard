import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  Download,
  DollarSign,
  BarChart3,
  Eye
} from "lucide-react";
import moment from "moment";

export default function EducatorAnalyticsContent({ currentUser }) {
  const [selectedModule, setSelectedModule] = useState("all");
  const [dateRange, setDateRange] = useState("30"); // days

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => base44.entities.Module.list(),
  });

  const { data: moduleProgress = [] } = useQuery({
    queryKey: ["allModuleProgress"],
    queryFn: () => base44.entities.UserModuleProgress.list(),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["allPages"],
    queryFn: () => base44.entities.ModulePage.list(),
  });

  const { data: pageProgress = [] } = useQuery({
    queryKey: ["allPageProgress"],
    queryFn: () => base44.entities.SubModuleProgress.list(),
  });

  const { data: moduleEngagements = [] } = useQuery({
    queryKey: ["moduleEngagements"],
    queryFn: () => base44.entities.ModuleEngagement.list(),
  });

  // Filter by date range
  const cutoffDate = moment().subtract(parseInt(dateRange), 'days').toISOString();
  
  const recentProgress = moduleProgress.filter(
    p => new Date(p.created_date) >= new Date(cutoffDate)
  );

  // Calculate metrics
  const totalStudents = allUsers.filter(u => u.role === "user").length;
  const activeStudents = new Set(
    recentProgress.map(p => p.created_by)
  ).size;

  const filteredModules = selectedModule === "all" 
    ? modules 
    : modules.filter(m => m.id === selectedModule);

  const moduleStats = filteredModules.map(module => {
    const modProgress = moduleProgress.filter(p => p.moduleId === module.id);
    const completedCount = modProgress.filter(p => p.status === "Complete").length;
    const totalEnrolled = modProgress.length;
    const completionRate = totalEnrolled > 0 ? (completedCount / totalEnrolled) * 100 : 0;

    const modulePages = pages.filter(p => p.moduleId === module.id);
    const totalViews = moduleEngagements.filter(e => e.moduleId === module.id).length;
    
    const avgWatchTime = modProgress.reduce((sum, p) => sum + (p.videoWatchedPercent || 0), 0) / (modProgress.length || 1);

    return {
      id: module.id,
      title: module.title,
      phase: module.phase,
      totalEnrolled,
      completedCount,
      completionRate: Math.round(completionRate),
      totalViews,
      avgWatchTime: Math.round(avgWatchTime),
      pageCount: modulePages.length,
    };
  });

  // Page-level analytics
  const pageStats = pages.map(page => {
    const pageProgressRecords = pageProgress.filter(p => p.subModuleId === page.id);
    const completions = pageProgressRecords.filter(p => p.isComplete).length;
    const totalViews = pageProgressRecords.length;
    const completionRate = totalViews > 0 ? (completions / totalViews) * 100 : 0;

    const module = modules.find(m => m.id === page.moduleId);

    return {
      id: page.id,
      title: page.title,
      moduleName: module?.title || "Unknown",
      totalViews,
      completions,
      completionRate: Math.round(completionRate),
      downloads: page.downloads?.length || 0,
    };
  }).sort((a, b) => b.totalViews - a.totalViews);

  // Calculate total revenue (placeholder - would integrate with Stripe)
  const totalRevenue = 0; // TODO: Integrate with Stripe API

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-[#6B1B3D]">{totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-[#6B1B3D] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-blue-600">{activeStudents}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Completion</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(moduleStats.reduce((sum, m) => sum + m.completionRate, 0) / (moduleStats.length || 1))}%
                </p>
              </div>
              <Award className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-purple-600">${totalRevenue}</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Module Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Total Views</TableHead>
                <TableHead>Avg Watch %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduleStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{stat.phase}</Badge>
                  </TableCell>
                  <TableCell>{stat.totalEnrolled}</TableCell>
                  <TableCell>{stat.completedCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.completionRate} className="w-20 h-2" />
                      <span className="text-sm">{stat.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      {stat.totalViews}
                    </div>
                  </TableCell>
                  <TableCell>{stat.avgWatchTime}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Page Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Most Popular Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Completions</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Resources</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageStats.slice(0, 10).map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.title}</TableCell>
                  <TableCell className="text-sm text-gray-600">{stat.moduleName}</TableCell>
                  <TableCell>{stat.totalViews}</TableCell>
                  <TableCell>{stat.completions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.completionRate} className="w-16 h-2" />
                      <span className="text-sm">{stat.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-gray-400" />
                      {stat.downloads}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}