"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  CreditCard,
  BarChart3,
  Settings2,
  Users,
  ShoppingCart,
  TrendingUp,
  FolderTree,
  History,
  UserCog,
  Truck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// This is sample data.
const data = {
  teams: [
    {
      name: "Coffe Shop",
      logo: ShoppingCart,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Product Management",
      url: "/admin/product",
      icon: Package,
    },
    {
      title: "Category Management",
      url: "/admin/category",
      icon: FolderTree,
    },
    {
      title: "Purchases",
      url: "/admin/purchases",
      icon: ShoppingCart,
    },
    {
      title: "Order History",
      url: "/admin/orders",
      icon: History,
    },
    {
      title: "Analysis",
      url: "/admin/analysis",
      icon: BarChart3,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: Users,
    },
    {
      title: "User Management",
      url: "/admin/user",
      icon: UserCog,
    },
    {
      title: "Supliers Management",
      url: "/admin/supliers",
      icon: Truck,
    },
    {
      title: "Settings",
      url: "/admin/setting",
      icon: Settings2,
    },
  ],
};

export function AdminSidebar({
  user = {
    name: "Cashier",
    email: "cashier@example.com",
    avatar: "/avatars/cashier.jpg",
  },
  ...props
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItemsWithActive = data.navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url !== "/admin" && pathname.startsWith(item.url)),
  }));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItemsWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
