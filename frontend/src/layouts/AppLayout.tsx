import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/context/AuthContext';

export function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
