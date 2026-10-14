import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  Flag,
  Tag,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
        <p className="text-xs text-text-muted">Loading administrator metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Marketplace Moderation & Health
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time database analytics and administrative oversight
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{stats?.totalUsers || 0}</p>
          <span className="text-[11px] text-text-muted">Registered accounts</span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{stats?.pendingListings || 0}</p>
          <span className="text-[11px] text-amber-800 font-semibold">Awaiting approval</span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Active Listings</span>
            <CheckCircle className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-extrabold text-brand-green">{stats?.activeListings || 0}</p>
          <span className="text-[11px] text-text-muted">Public marketplace</span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Completed Sales</span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{stats?.soldListings || 0}</p>
          <span className="text-[11px] text-text-muted">Items sold</span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Open Reports</span>
            <Flag className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-extrabold text-red-700">{stats?.openReports || 0}</p>
          <span className="text-[11px] text-red-800 font-semibold">Requires action</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/moderation"
          className="clay-card-interactive p-5 bg-white flex flex-col justify-between h-36"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Review Queue
              </span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-base text-text-primary mt-2">
              Listing Moderation
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Approve or reject new seller submissions.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-green flex items-center gap-1">
            Open Queue <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/users"
          className="clay-card-interactive p-5 bg-white flex flex-col justify-between h-36"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Accounts
              </span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-base text-text-primary mt-2">
              User Management
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Search users and manage suspension status.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-green flex items-center gap-1">
            View Users <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/reports"
          className="clay-card-interactive p-5 bg-white flex flex-col justify-between h-36"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Safety
              </span>
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-base text-text-primary mt-2">
              User Reports
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Investigate scams, duplicates, and violations.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-green flex items-center gap-1">
            Review Reports <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="clay-card-interactive p-5 bg-white flex flex-col justify-between h-36"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Audit Trail
              </span>
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-base text-text-primary mt-2">
              Security Audit Logs
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Immutable records of all admin actions.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-green flex items-center gap-1">
            Inspect Logs <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
