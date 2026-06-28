import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommandPalette } from "@/components/command/command-palette";

export function AppLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* flex-1 mengisi sisa ruang setelah spacer div dari Sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header title={title} />
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in"
        >
          {children}
        </main>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
