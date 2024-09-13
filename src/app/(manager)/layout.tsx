import { DashboardLayout } from "@/components/shared/dashboard/DashboardLayout";
import { MANAGER_SIDEBAR } from "@/components/shared/dashboard/sidebar";
import getQueryClient from "@/hooks/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

export default function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <DashboardLayout
        sidebarArray={MANAGER_SIDEBAR}
        title="Welcome home, Manager"
      >
        {children}
      </DashboardLayout>
    </HydrationBoundary>
  );
}
