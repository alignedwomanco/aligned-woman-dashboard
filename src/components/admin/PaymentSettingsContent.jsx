import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Globe, ShoppingCart, Users, TrendingUp, Key } from "lucide-react";
import RegionalPricingManager from "./payments/RegionalPricingManager";
import SalesOverview from "./payments/SalesOverview";
import WaitlistManager from "./payments/WaitlistManager";
import AbandonedCartManager from "./payments/AbandonedCartManager";
import CourseAccessManager from "./payments/CourseAccessManager";

export default function PaymentSettingsContent() {
  const [subTab, setSubTab] = useState("pricing");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#6E1D40]">
            <DollarSign className="w-5 h-5" />
            Payment Settings
          </CardTitle>
          <p className="text-sm text-gray-500">
            Manage regional pricing, view sales, track signups and abandoned carts.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={subTab} onValueChange={setSubTab}>
            <TabsList className="bg-gray-100 mb-6">
              <TabsTrigger value="pricing" className="gap-1.5">
                <Globe className="w-4 h-4" /> Regional Pricing
              </TabsTrigger>
              <TabsTrigger value="sales" className="gap-1.5">
                <TrendingUp className="w-4 h-4" /> Sales
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="gap-1.5">
                <Users className="w-4 h-4" /> Waitlist
              </TabsTrigger>
              <TabsTrigger value="abandoned" className="gap-1.5">
                <ShoppingCart className="w-4 h-4" /> Abandoned Carts
              </TabsTrigger>
              <TabsTrigger value="access" className="gap-1.5">
                <Key className="w-4 h-4" /> Course Access
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing">
              <RegionalPricingManager />
            </TabsContent>
            <TabsContent value="sales">
              <SalesOverview />
            </TabsContent>
            <TabsContent value="waitlist">
              <WaitlistManager />
            </TabsContent>
            <TabsContent value="abandoned">
              <AbandonedCartManager />
            </TabsContent>
            <TabsContent value="access">
              <CourseAccessManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}