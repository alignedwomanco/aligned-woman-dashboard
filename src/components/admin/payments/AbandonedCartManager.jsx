import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";

export default function AbandonedCartManager() {
  const { data: carts = [], isLoading } = useQuery({
    queryKey: ["abandonedCarts"],
    queryFn: () => base44.entities.AbandonedCart.list("-created_date", 200),
  });

  const unconverted = carts.filter((c) => !c.converted);
  const converted = carts.filter((c) => c.converted);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-[#6E1D40] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-gray-500">Total Abandoned</p>
            <p className="text-2xl font-bold text-gray-900">{carts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-gray-500">Still Open</p>
            <p className="text-2xl font-bold text-orange-600">{unconverted.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm text-gray-500">Recovered</p>
            <p className="text-2xl font-bold text-green-600">{converted.length}</p>
          </CardContent>
        </Card>
      </div>

      {carts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No abandoned carts tracked yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.region || "—"}</TableCell>
                    <TableCell className="capitalize">{c.purchase_type || "—"}</TableCell>
                    <TableCell className="capitalize">{c.payment_provider || "—"}</TableCell>
                    <TableCell>
                      <Badge className={c.converted ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                        {c.converted ? "Recovered" : "Open"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {c.created_date ? new Date(c.created_date).toLocaleDateString() : "—"}
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