import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar/Navbar';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback((): void => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback((): void => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-r border-border bg-muted/30 md:block">
          <Sidebar />
        </aside>

        {/* Mobile sidebar drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0 md:hidden">
            <SheetTitle className="sr-only">Sidebar navigation</SheetTitle>
            <SheetDescription className="sr-only">Browse content items by phase</SheetDescription>
            <div className="h-full overflow-y-auto bg-muted/30 pt-10">
              <Sidebar onItemSelect={handleCloseSidebar} />
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
