import { useEffect, useState } from 'react';
import { Download, FileBarChart, Loader2 } from 'lucide-react';
import { api, type ReportSummary } from '@/lib/api';

export function Reports() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ReportSummary[]>('/reports')
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(id: string) {
    setDownloadingId(id);
    try {
      const res = await api.get(`/reports/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `sentinelx-report-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          A PDF report is generated automatically for every assessment you run.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface/70 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-14 text-muted-foreground text-sm">
            <FileBarChart className="mx-auto mb-2 opacity-50" size={28} />
            No reports yet — run a Website Assessment to generate one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Risk Level</th>
                <th className="px-5 py-3 font-medium">Generated</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">{r.title}</td>
                  <td className="px-5 py-3 capitalize">{r.risk_level}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDownload(r.id)}
                      disabled={downloadingId === r.id}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs disabled:opacity-50"
                    >
                      {downloadingId === r.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
