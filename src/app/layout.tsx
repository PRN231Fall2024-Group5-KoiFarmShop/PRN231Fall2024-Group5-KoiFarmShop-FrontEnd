import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ToastContainer } from 'react-toastify';
import "../styles/globals.css";
import 'react-toastify/dist/ReactToastify.css';
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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
