interface RiskBadgeProps {
  score: number;
  level: 'low' | 'medium' | 'high';
}

const LEVEL_STYLES: Record<string, { label: string; classes: string }> = {
  low: { label: 'Low Risk', classes: 'bg-success/10 text-success border-success/30' },
  medium: { label: 'Medium Risk', classes: 'bg-warning/10 text-warning border-warning/30' },
  high: { label: 'High Risk', classes: 'bg-critical/10 text-critical border-critical/30' },
};

export function RiskBadge({ score, level }: RiskBadgeProps) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${style.classes}`}
    >
      {style.label} · {score}/100
    </span>
  );
}
