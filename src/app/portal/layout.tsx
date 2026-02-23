import { ComplaintsProvider } from "@/context/complaints-context";
import { RailMadadHeader } from "@/components/layout/rail-madad-header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComplaintsProvider>
      <div className="min-h-screen bg-background">
        <RailMadadHeader authenticated userName="Prithvi Singh" />
        <main className="mx-auto w-full max-w-[1280px] p-4 md:p-8">{children}</main>
      </div>
    </ComplaintsProvider>
  );
}
