import { requireRole } from "@/hooks/auth-helpers";
import { ModeToggle } from "@/components/ModeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CashierSidebar } from "@/components/sidebar/cashier/cashier-sidebar";
import { LogoutButton } from "@/components/logout-button";

/**
 * Cashier layout with authentication check
 * Accessible by users with 'cashier' or 'admin' role
 */
export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require cashier or admin role for this layout
  const session = await requireRole(["cashier", "admin"]);

  // Prepare user data for sidebar
  const userData = {
    name: session.user.name || session.user.email || "Cashier",
    email: session.user.email || "cashier@example.com",
    avatar: session.user.image || "/avatars/cashier.jpg",
  };

  return (
    <SidebarProvider>
      <CashierSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  Cashier
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>POS System</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-sm md:block">
              <span className="text-muted-foreground">Welcome, </span>
              <span className="font-semibold">
                {session.user.name || session.user.email}
              </span>
            </div>
            <NotificationBell />
            <ModeToggle />
            <LogoutButton variant="outline" size="sm" />
          </div>
        </header>
        <main className="px-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
