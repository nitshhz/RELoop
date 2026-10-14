import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Suspend Modal
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [search]);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/users', {
        params: { ...(search && { search }) },
      });
      setUsers(data.users || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  function openSuspendModal(u) {
    setTargetUser(u);
    setSuspensionReason('');
    setSuspendModalOpen(true);
  }

  async function submitSuspension(e) {
    e.preventDefault();
    if (!targetUser) return;
    setSuspendModalOpen(false);

    try {
      await apiRequest(`/admin/users/${targetUser.id}/suspend`, {
        method: 'PATCH',
        data: {
          isSuspended: true,
          reason: suspensionReason.trim() || 'Terms of service violation',
        },
      });
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Suspension failed.');
    }
  }

  async function handleReactivate(id) {
    try {
      await apiRequest(`/admin/users/${id}/suspend`, {
        method: 'PATCH',
        data: { isSuspended: false },
      });
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Reactivation failed.');
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Accounts</h1>
          <p className="text-xs text-text-muted mt-1">
            Manage permissions, review account status, and enforce community bans
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full clay-input pl-10 pr-4 py-2 text-xs bg-white"
          />
        </div>
      </div>

      <div className="clay-card p-6 bg-white overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No users found.</div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {users.map((u) => (
              <div
                key={u.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border-subtle overflow-hidden shrink-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-green-soft text-brand-green font-bold text-sm flex items-center justify-center">
                        {u.name[0]}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-text-primary">{u.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-background-secondary text-text-muted">
                        {u.role}
                      </span>
                      {u.isSuspended && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{u.email}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Joined: {new Date(u.createdAt).toLocaleDateString()} • {u._count?.listings || 0} listings
                    </p>
                  </div>
                </div>

                {/* Suspension controls */}
                <div className="self-end sm:self-auto">
                  {u.role !== 'ADMIN' && (
                    u.isSuspended ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReactivate(u.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1 text-brand-green" />
                        Reactivate Account
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => openSuspendModal(u)}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Suspend Account
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suspend Confirmation Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title="Suspend User Account"
      >
        <form onSubmit={submitSuspension} className="space-y-4">
          <p className="text-xs text-text-muted">
            Suspending <strong>{targetUser?.name}</strong> will prevent them from logging in, creating listings, and sending offers or messages.
          </p>

          <Input
            label="Suspension Reason *"
            required
            placeholder="e.g. Repeated scam reports, abusive chat behavior, fraudulent items"
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSuspendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Confirm Suspension
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
