// Sidebar.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Home, ShoppingCart, Package, Users, LineChart } from "lucide-react";

const iconComponents: any = {
  Home: Home,
  ShoppingCart: ShoppingCart,
  Package: Package,
  Users: Users,
  LineChart: LineChart,
};

interface SidebarItem {
  icon: string;
  name: string;
  href: string;
  badge?: string;
  active?: boolean;
}

export function DashboardSidebar({ items }: { items: SidebarItem[] }) {
  return (
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {items.map((item, index) => {
          const IconComponent = iconComponents[item.icon] || null;

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                item.active ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              {item.name}
              {item.badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
