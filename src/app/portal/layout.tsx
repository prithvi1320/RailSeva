import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { ComplaintsProvider } from "@/context/complaints-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComplaintsProvider>
      <SidebarProvider>
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col h-screen bg-background">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ComplaintsProvider>
  );
}
