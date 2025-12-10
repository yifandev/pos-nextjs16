"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, Receipt, Clock, BarChart3 } from "lucide-react";

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

interface CashierSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const data = {
  teams: [
    {
      name: "Coffee Shop",
      logo: ShoppingCart,
      plan: "Cashier",
    },
  ],
  navMain: [
    {
      title: "Point of Sale",
      url: "/cashier",
      icon: ShoppingCart,
    },
    {
      title: "Riwayat Penjualan",
      url: "/cashier/sales",
      icon: Receipt,
    },
    {
      title: "Kelola Shift",
      url: "/cashier/shift",
      icon: Clock,
    },
  ],
};

export function CashierSidebar({
  user = {
    name: "Cashier",
    email: "cashier@example.com",
    avatar: "/avatars/cashier.jpg",
  },
  ...props
}: CashierSidebarProps) {
  const pathname = usePathname();

  const navItemsWithActive = data.navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url !== "/cashier" && pathname.startsWith(item.url)),
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
