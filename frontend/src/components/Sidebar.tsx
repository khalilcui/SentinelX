import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Network,
  FileBarChart,
  ShieldHalf,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/website-assessment', label: 'Website Assessment', icon: Globe },
  { to: '/app/network-assessment', label: 'Network Assessment', icon: Network },
  { to: '/app/reports', label: 'Reports', icon: FileBarChart },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-surface/60 backdrop-blur-xl px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <ShieldHalf className="text-primary" size={26} />
        <span
          className="text-2xl text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          SentinelX
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary glow-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-lg liquid-glass px-3 py-3 text-xs text-muted-foreground">
        Defensive assessments only — for systems you own or are authorized to test.
      </div>
    </aside>
  );
}
