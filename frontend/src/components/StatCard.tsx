import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  tone?: 'primary' | 'success' | 'warning' | 'critical';
}

const TONE_CLASSES: Record<string, string> = {
  primary: 'text-primary bg-primary/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  critical: 'text-critical bg-critical/10',
};

export function StatCard({ label, value, icon: Icon, trend, tone = 'primary' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${TONE_CLASSES[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 text-3xl font-semibold text-foreground">{value}</div>
      {trend && <div className="mt-1 text-xs text-muted-foreground">{trend}</div>}
    </div>
  );
}
