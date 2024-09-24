import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, CircleUser, Package2, SmileIcon } from "lucide-react";
import Link from "next/link";
import { DashboardSidebar, MobileSidebar, SidebarItem } from "./DashboardSidebar";
import NotificationBar from "@/components/notification-bar";

export function DashboardLayout({ children, sidebarArray, title = "Welcome home" }: { children: React.ReactNode, sidebarArray: SidebarItem[], title?: string }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">KoiFarmShop</span>
            </Link>
          </div>

          {/* Use Sidebar Component */}
          <DashboardSidebar items={sidebarArray} />
        </div>
      </div>

      <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                <MobileSidebar items={sidebarArray}/>
            
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <SmileIcon className="h-6 w-6" />
                <span>{title}</span>
            </Link>
            
            <NotificationBar />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
