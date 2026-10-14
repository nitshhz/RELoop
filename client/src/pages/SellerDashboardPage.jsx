import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  Heart,
  Tag,
  MessageSquare,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle,
  Plus,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { Button } from '../components/ui/Button.jsx';
import { StatusBadge } from '../components/ui/Badge.jsx';

export function SellerDashboardPage() {
  const [data, setData] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [statusFilter]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [analyticsRes, listingsRes] = await Promise.all([
        apiRequest('/analytics/seller-dashboard'),
        apiRequest('/listings/user/my-listings', {
          params: { ...(statusFilter && { status: statusFilter }) },
        }),
      ]);
      setData(analyticsRes);
      setMyListings(listingsRes.listings || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeStatus(id, newStatus) {
    try {
      await apiRequest(`/listings/${id}/status`, {
        method: 'PATCH',
        data: { status: newStatus },
      });
      await loadDashboard();
    } catch (err) {
      alert(err.message || 'Could not update status.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await apiRequest(`/listings/${id}`, { method: 'DELETE' });
      await loadDashboard();
    } catch (err) {
      alert(err.message || 'Could not delete listing.');
    }
  }

  if (loading && !data) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin mx-auto mb-2" />
        <p className="text-xs text-text-muted">Loading seller metrics & listings...</p>
      </div>
    );
  }

  const s = data?.summary || {
    activeListings: 0,
    draftListings: 0,
    pendingListings: 0,
    reservedListings: 0,
    soldListings: 0,
    totalViews: 0,
    totalSaves: 0,
    incomingOffers: 0,
    unreadMessages: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Seller Dashboard & Analytics
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Track views, negotiations, and inventory status backed by live database records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/ai-creator">
            <Button variant="secondary" size="sm">
              <Sparkles className="w-4 h-4 mr-1 text-brand-green" /> AI Creator
            </Button>
          </Link>
          <Link to="/sell">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Active Listings</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{s.activeListings}</p>
          <span className="text-[11px] text-text-muted">
            {s.soldListings} sold • {s.pendingListings} pending
          </span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Total Product Views</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{s.totalViews}</p>
          <span className="text-[11px] text-text-muted">Across all your listings</span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Saved by Buyers</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{s.totalSaves}</p>
          <span className="text-[11px] text-text-muted">Buyer bookmarks</span>
        </div>

        <div className="clay-card p-5 bg-white space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Negotiations</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{s.incomingOffers}</p>
          <span className="text-[11px] text-text-muted">
            {s.unreadMessages} unread messages
          </span>
        </div>
      </div>

      {/* Completeness Recommendations (if any listings have score < 80) */}
      {data?.incompleteListings && data.incompleteListings.length > 0 && (
        <div className="clay-card p-5 bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Listing Completeness Recommendations</span>
          </div>
          <p className="text-xs text-amber-800">
            Listings with detailed photos, exact brand names, and condition notes sell 2.8x faster.
          </p>
          <div className="space-y-2">
            {data.incompleteListings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 text-xs"
              >
                <div>
                  <span className="font-bold text-text-primary">{item.title}</span>
                  <p className="text-[11px] text-text-muted mt-0.5">{item.suggestion}</p>
                </div>
                <Link to={`/listing/${item.id}/edit`}>
                  <Button size="sm" variant="outline">
                    Improve Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings Management Table / Cards */}
      <div className="clay-card bg-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Your Listings</h2>
            <p className="text-xs text-text-muted">Manage inventory, adjust prices, and mark items sold</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-semibold">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="clay-input py-1 px-2.5 text-xs bg-white font-medium"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Live (Active)</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {myListings.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Tag className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-xs text-text-muted">No listings match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-background-secondary overflow-hidden shrink-0 border border-border-subtle">
                    {item.images && item.images[0] ? (
                      <img
                        src={item.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/listing/${item.id}`}
                        className="font-bold text-sm text-text-primary hover:text-brand-green truncate"
                      >
                        {item.title}
                      </Link>
                      <StatusBadge status={item.status} />
                    </div>

                    <p className="text-xs font-bold text-brand-green mt-0.5">
                      ₹{item.price?.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                      <span>{item.viewsCount || 0} views</span>
                      <span>•</span>
                      <span>{item._count?.savedBy || 0} saves</span>
                      <span>•</span>
                      <span>{item._count?.offers || 0} offers</span>
                    </div>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {item.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChangeStatus(item.id, 'RESERVED')}
                    >
                      Mark Reserved
                    </Button>
                  )}

                  {item.status === 'RESERVED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleChangeStatus(item.id, 'SOLD')}
                    >
                      Mark Sold
                    </Button>
                  )}

                  <Link to={`/listing/${item.id}/edit`}>
                    <Button size="sm" variant="secondary" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-text-muted hover:text-red-600 rounded-lg transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
