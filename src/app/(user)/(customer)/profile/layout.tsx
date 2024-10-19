"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { name: "General", href: "/profile" },
  // { name: "Deposit", href: "/profile/deposit" },
  // { name: "Withdraw", href: "/profile/withdraw" },
  { name: "Order History", href: "/profile/order-history" },
  { name: "Transaction History", href: "/profile/transaction-history" },
];

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="mt-6 w-64 p-4">
        <nav className="flex flex-col gap-2">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded px-4 py-2 transition-colors",
                    pathname === item.href ||
                      (pathname === "/profile/edit" && item.href === "/profile")
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:bg-primary/50 hover:text-white",
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
