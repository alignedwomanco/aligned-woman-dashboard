import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WorkbookList({ onNew, onEdit }) {
  const { data: workbooks = [], isLoading } = useQuery({
    queryKey: ["adminWorkbooks"],
    queryFn: () => base44.entities.Workbook.list("order"),
  });

  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: () => base44.entities.Expert.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => base44.entities.Course.list(),
  });

  // Sort: order asc, then updated_date desc
  const sorted = [...workbooks].sort((a, b) => {
    const oa = a.order ?? Infinity;
    const ob = b.order ?? Infinity;
    if (oa !== ob) return oa - ob;
    return (b.updated_date || "").localeCompare(a.updated_date || "");
  });

  const expertName = (id) => experts.find((e) => e.id === id)?.name || "—";
  const courseName = (id) => courses.find((c) => c.id === id)?.title || "—";

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            WORKBOOKS · ADMIN
          </p>
          <h2 className="text-2xl font-bold" style={{ color: "#6E1D40" }}>
            All <em className="not-italic" style={{ color: "#C4847A", fontStyle: "italic" }}>Workbooks</em>
          </h2>
        </div>
        <Button onClick={onNew} className="text-white" style={{ backgroundColor: "#6E1D40" }}>
          <Plus className="w-4 h-4 mr-2" /> New Workbook
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: "#6E1D40", borderTopColor: "transparent" }} />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl text-gray-400">
          <p className="font-medium">No workbooks yet</p>
          <p className="text-sm">Click "+ New Workbook" to create one.</p>
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Expert</TableHead>
                <TableHead className="hidden md:table-cell">Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((wb) => (
                <TableRow key={wb.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="min-w-0">
                      <span className="font-medium text-sm text-[#6E1D40] block truncate">{wb.title}</span>
                      {wb.subtitle && <span className="text-xs text-gray-500 block truncate">{wb.subtitle}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="bg-[#F5E8EE] text-[#6E1D40] border-0 text-xs">
                      {expertName(wb.expert_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">
                    {courseName(wb.course_id)}
                  </TableCell>
                  <TableCell>
                    {wb.status === "published" ? (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs uppercase">Published</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-0 text-xs uppercase">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-gray-500">
                    {fmtDate(wb.updated_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(wb)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0 opacity-40 cursor-not-allowed">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="text-xs">Delete is not yet supported. Use draft status as soft-delete.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}