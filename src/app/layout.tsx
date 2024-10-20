import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Koi Farm",
  description: "Buy and sell koi fish online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
