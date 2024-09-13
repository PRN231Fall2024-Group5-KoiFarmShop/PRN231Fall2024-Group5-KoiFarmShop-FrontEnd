"use client";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";

function QueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 300000, // Lưu trữ dữ liệu trong cache trong 5 phút (tính bằng mili giây)
        staleTime: 60000, // Coi dữ liệu là cũ sau 1 phút (tính bằng mili giây)
        refetchOnWindowFocus: false, // Tắt tự động refetch khi cửa sổ được focus
        retry: 3, // Thử lại truy vấn lỗi tối đa 3 lần
      },
      mutations: {
        throwOnError: true, // Throw error nếu mutation gặp lỗi
      },
    },
  }));
  const dehydratedState = dehydrate(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}

export default QueryProvider;
