import { DashboardLayout } from "@/components/shared/dashboard/DashboardLayout";
import { ADMIN_SIDEBAR } from "@/components/shared/dashboard/sidebar";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardLayout
      sidebarArray={ADMIN_SIDEBAR}
      title="Welcome home, Admin"
    >
      {children}
    </DashboardLayout>
  );
}
