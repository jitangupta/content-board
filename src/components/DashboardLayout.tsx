import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar/Navbar';
import { Sidebar } from '@/components/Sidebar/Sidebar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[280px] overflow-y-auto border-r md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
