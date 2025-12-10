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
import { LogoutButton } from "@/components/logout-button";
import { AdminSidebar } from "@/components/sidebar/admin/app-sidebar";

/**
 * Admin layout with authentication check
 * Only accessible by users with 'admin' role
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require admin role for this layout
  const session = await requireRole(["admin"]);

  const userData = {
    name: session.user.name || session.user.email || "Admin",
    email: session.user.email || "Admin@example.com",
    avatar: session.user.image || "/avatars/cashier.jpg",
  };

  return (
    <SidebarProvider>
      <AdminSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  Admin Dashboard
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
