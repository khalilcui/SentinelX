import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Network, FileBarChart, ShieldAlert, Activity, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { StatCard } from '@/components/StatCard';
import { RiskBadge } from '@/components/RiskBadge';
import { api, type WebsiteAssessmentResult } from '@/lib/api';

const RISK_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export function Dashboard() {
  const [assessments, setAssessments] = useState<WebsiteAssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<WebsiteAssessmentResult[]>('/assessments/website')
      .then((res) => setAssessments(res.data))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, []);

  const low = assessments.filter((a) => a.risk_score < 40).length;
  const med = assessments.filter((a) => a.risk_score >= 40 && a.risk_score < 70).length;
  const high = assessments.filter((a) => a.risk_score >= 70).length;

  const riskData = [
    { name: 'Low', value: low },
    { name: 'Warning', value: med },
    { name: 'Critical', value: high },
  ];

  const timeline = assessments
    .slice()
    .reverse()
    .map((a, i) => ({ name: `#${i + 1}`, score: a.risk_score }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your security assessments</p>
        </div>
        <Link
          to="/app/website-assessment"
          className="flex items-center gap-2 rounded-lg bg-primary text-sm font-medium px-4 py-2.5 hover:opacity-90 transition-opacity"
          style={{ color: '#050816' }}
        >
          <PlusCircle size={16} /> New Assessment
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Assessments" value={assessments.length} icon={Activity} tone="primary" />
        <StatCard label="Website Assessments" value={assessments.length} icon={Globe} tone="primary" />
        <StatCard label="Network Assessments" value={0} icon={Network} tone="warning" />
        <StatCard label="Reports Generated" value={assessments.length} icon={FileBarChart} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface/70 p-5">
          <h3 className="font-medium mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {riskData.map((_, i) => (
                  <Cell key={i} fill={RISK_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid hsl(222 30% 18%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-2">
            <span>● Low ({low})</span>
            <span>● Warning ({med})</span>
            <span>● Critical ({high})</span>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/70 p-5">
          <h3 className="font-medium mb-4">Assessment Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="name" stroke="#8b95a7" fontSize={12} />
              <YAxis stroke="#8b95a7" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid hsl(222 30% 18%)' }} />
              <Line type="monotone" dataKey="score" stroke="#00E5FF" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/70 p-5">
        <h3 className="font-medium mb-4">Recent Activity</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : assessments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <ShieldAlert className="mx-auto mb-2 opacity-50" size={28} />
            No assessments yet. Run your first website assessment to see activity here.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {assessments.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm text-foreground">{a.target_url}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                <RiskBadge score={a.risk_score} level={a.risk_level} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
