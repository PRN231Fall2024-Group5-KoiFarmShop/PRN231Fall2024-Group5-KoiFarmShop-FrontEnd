import { DashboardLayout } from "@/components/shared/dashboard/DashboardLayout";
import { ADMIN_SIDEBAR } from "@/components/shared/dashboard/sidebar";
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
      <DashboardLayout
        sidebarArray={ADMIN_SIDEBAR}
        title="Welcome home, Admin"
      >
        {children}
      </DashboardLayout>
    </HydrationBoundary>
  );
}
