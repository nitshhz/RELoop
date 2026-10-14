import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/audit-logs');
      setLogs(data.logs || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/admin"
        className="text-xs text-text-muted hover:text-brand-green flex items-center gap-1 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to admin dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Security Audit Logs ({logs.length})
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Immutable trail of administrative approvals, rejections, bans, and policy interventions
        </p>
      </div>

      <div className="clay-card p-6 bg-white overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading audit entries...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-background-secondary/50 text-text-muted font-bold">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Admin</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-background-secondary/30">
                    <td className="py-3 px-4 font-bold text-purple-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {log.targetType} ({log.targetId?.slice(0, 8)}...)
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {log.admin?.name || log.adminId}
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {log.reason || 'None specified'}
                    </td>
                    <td className="py-3 px-4 text-text-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
