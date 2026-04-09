import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, ShoppingBag } from "lucide-react";

export default function SalesOverview() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: () => base44.entities.Sale.list("-created_date", 100),
  });

  const completedSales = sales.filter((s) => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + (s.amount || 0), 0);

  const statusColor = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    refunded: "bg-red-100 text-red-800",
    failed: "bg-gray-100 text-gray-600",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-[#6E1D40] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedSales.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      {sales.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No sales recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{sale.buyer_name || "—"}</span>
                        <div className="text-xs text-gray-400">{sale.buyer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {sale.currency || "$"}{sale.amount}
                    </TableCell>
                    <TableCell>{sale.region || "—"}</TableCell>
                    <TableCell className="capitalize">{sale.purchase_type || "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[sale.status] || statusColor.pending}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {sale.created_date ? new Date(sale.created_date).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}