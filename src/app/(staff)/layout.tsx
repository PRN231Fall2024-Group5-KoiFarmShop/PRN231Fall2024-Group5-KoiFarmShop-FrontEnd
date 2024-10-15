import { DashboardLayout } from "@/components/shared/dashboard/DashboardLayout";
import { STAFF_SIDEBAR } from "@/components/shared/dashboard/sidebar";
import React from "react";

export default function StaffLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
      <DashboardLayout
        sidebarArray={STAFF_SIDEBAR}
        title="Welcome home, Staff"
      >
        {children}
      </DashboardLayout>
  );
}
