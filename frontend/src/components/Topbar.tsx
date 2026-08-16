import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/40 backdrop-blur-xl px-6 py-4">
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search assessments, reports, CVEs..."
          className="w-full rounded-lg bg-white/5 border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-critical animate-pulse-glow" />
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="hidden sm:block text-sm">
            <div className="text-foreground leading-tight">{user?.full_name ?? 'User'}</div>
            <div className="text-muted-foreground text-xs leading-tight">{user?.role ?? 'analyst'}</div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="ml-2 text-muted-foreground hover:text-critical"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
