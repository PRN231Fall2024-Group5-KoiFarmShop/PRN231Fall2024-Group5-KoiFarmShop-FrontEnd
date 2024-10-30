"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    name: "General",
    href: "/profile",
    isActive: (pathname: string) => pathname === "/profile",
  },
  {
    name: "My Koi Fish",
    href: "/profile/koi-fish",
    isActive: (pathname: string) =>
      pathname === "/profile/koi-fish" || pathname.includes("/koi-fish/"),
  },
  {
    name: "Request for Sale",
    href: "/profile/request-for-sale",
    isActive: (pathname: string) => pathname === "/profile/request-for-sale",
  },
  {
    name: "Order History",
    href: "/profile/order-history",
    isActive: (pathname: string) => pathname === "/profile/order-history",
  },
  {
    name: "Transaction History",
    href: "/profile/transaction-history",
    isActive: (pathname: string) => pathname === "/profile/transaction-history",
  },
];

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="mt-6 w-64 border-r border-r-gray-400 p-4">
        <nav className="flex flex-col gap-2">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded px-4 py-2 transition-colors",
                    item.isActive(pathname)
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-primary/50 hover:text-white",
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
