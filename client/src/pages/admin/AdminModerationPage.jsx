import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Tag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Textarea } from '../../components/ui/Input.jsx';
import { ConditionBadge } from '../../components/ui/Badge.jsx';

export function AdminModerationPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/listings/pending');
      setListings(data.listings || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setActionId(id);
    try {
      await apiRequest(`/admin/listings/${id}/moderate`, {
        method: 'POST',
        data: { action: 'APPROVE', reason: 'Meets marketplace safety standards' },
      });
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionId(null);
    }
  }

  function openRejectModal(listing) {
    setSelectedListing(listing);
    setRejectReason('');
    setRejectModalOpen(true);
  }

  async function submitReject(e) {
    e.preventDefault();
    if (!selectedListing) return;
    setActionId(selectedListing.id);
    setRejectModalOpen(false);

    try {
      await apiRequest(`/admin/listings/${selectedListing.id}/moderate`, {
        method: 'POST',
        data: { action: 'REJECT', reason: rejectReason.trim() || 'Violates marketplace quality guidelines' },
      });
      setListings((prev) => prev.filter((l) => l.id !== selectedListing.id));
    } catch (err) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionId(null);
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Listing Moderation Queue ({listings.length})
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Review submitted listings before they become publicly discoverable
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading pending submissions...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
          <CheckCircle className="w-10 h-10 text-brand-green mx-auto" />
          <h3 className="font-bold text-text-primary">Queue is all clear!</h3>
          <p className="text-xs text-text-muted">
            All submitted listings have been reviewed and approved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="clay-card p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Product preview */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-20 h-20 rounded-xl bg-background-secondary overflow-hidden shrink-0 border border-border-subtle">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Tag className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-muted uppercase">
                      {item.category?.name}
                    </span>
                    <ConditionBadge condition={item.condition} />
                  </div>

                  <h3 className="font-bold text-sm text-text-primary truncate">{item.title}</h3>

                  <p className="text-xs font-bold text-brand-green">
                    ₹{item.price?.toLocaleString()}
                  </p>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="text-[11px] text-text-muted pt-1">
                    Seller: <strong className="text-text-primary">{item.seller?.name}</strong> (
                    {item.seller?.email}) • Submitted:{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={actionId === item.id}
                  onClick={() => handleApprove(item.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Approve Listing
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionId === item.id}
                  onClick={() => openRejectModal(item)}
                >
                  <XCircle className="w-4 h-4 mr-1.5 text-red-600" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Listing"
      >
        <form onSubmit={submitReject} className="space-y-4">
          <p className="text-xs text-text-muted">
            Provide a clear moderation reason. The seller will receive an in-app notification with this explanation.
          </p>

          <Textarea
            label="Moderation Reason *"
            required
            rows={3}
            placeholder="e.g. Unclear photos, counterfeit item suspicion, prohibited brand, or missing accessories details"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
