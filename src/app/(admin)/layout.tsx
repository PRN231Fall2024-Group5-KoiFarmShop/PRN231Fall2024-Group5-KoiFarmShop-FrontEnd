import { DashboardLayout } from "@/components/shared/dashboard/DashboardLayout";
import getQueryClient from "@/hooks/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </HydrationBoundary>
  );
}
