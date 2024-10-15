import { DashboardLayout } from "@/components/shared/dashboard/DashboardLayout";
import { MANAGER_SIDEBAR } from "@/components/shared/dashboard/sidebar";
import React from "react";

export default function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
      <DashboardLayout
        sidebarArray={MANAGER_SIDEBAR}
        title="Welcome home, Manager"
      >
        {children}
      </DashboardLayout>
  );
}
