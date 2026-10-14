import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Textarea } from '../../components/ui/Input.jsx';

export function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeReport, setActiveReport] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveStatus, setResolveStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/reports');
      setReports(data.reports || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  function openResolveModal(report, status) {
    setActiveReport(report);
    setResolveStatus(status);
    setResolutionNotes('');
    setResolveModalOpen(true);
  }

  async function submitResolution(e) {
    e.preventDefault();
    if (!activeReport) return;
    setSubmitting(true);

    try {
      await apiRequest(`/admin/reports/${activeReport.id}/resolve`, {
        method: 'POST',
        data: {
          status: resolveStatus,
          resolutionNotes: resolutionNotes.trim() || null,
        },
      });
      setResolveModalOpen(false);
      await loadReports();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setSubmitting(false);
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
          User & Content Reports ({reports.length})
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review community flags, suspected scams, and inappropriate listings
        </p>
      </div>

      <div className="clay-card p-6 bg-white overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No open reports.</div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {reports.map((r) => (
              <div
                key={r.id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {r.reason}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">
                      Target: {r.targetType} ({r.targetId})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  {r.details && (
                    <p className="text-xs text-text-primary pt-1">
                      Details: <span className="text-text-muted">"{r.details}"</span>
                    </p>
                  )}

                  <p className="text-[11px] text-text-muted">
                    Reported by: <strong>{r.reporter?.name}</strong> ({r.reporter?.email}) •{' '}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                {r.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openResolveModal(r, 'RESOLVED')}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openResolveModal(r, 'DISMISSED')}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={`Mark Report as ${resolveStatus}`}
      >
        <form onSubmit={submitResolution} className="space-y-4">
          <Textarea
            label="Resolution Notes"
            rows={3}
            placeholder="Add notes for the audit trail (e.g. Warning issued to seller, listing removed, false alarm)..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
