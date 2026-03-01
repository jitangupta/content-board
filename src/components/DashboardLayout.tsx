import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar/Navbar';
import { ContentListPlaceholder } from '@/components/Sidebar/ContentListPlaceholder';

export function DashboardLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[280px] border-r md:block">
          <ContentListPlaceholder />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
