import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import getQueryClient from "@/hooks/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Header></Header>
      {children}
      <Footer></Footer>
    </HydrationBoundary>
  );
}
