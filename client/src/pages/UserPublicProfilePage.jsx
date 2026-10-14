import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import { ListingCard } from '../components/marketplace/ListingCard.jsx';
import { ShieldCheck, Calendar, Tag, Loader2, ArrowLeft } from 'lucide-react';

export function UserPublicProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const [profileRes, listingsRes] = await Promise.all([
        apiRequest(`/auth/user/${userId}`),
        apiRequest('/listings', { params: { sellerId: userId } }),
      ]);
      setProfile(profileRes.user);
      setListings(listingsRes.listings || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
        <p className="text-xs text-text-muted">Loading seller profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="text-xl font-bold">User Not Found</h2>
        <Link to="/browse">
          <button className="text-xs text-brand-green font-bold underline">
            Back to browse
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/browse"
        className="text-xs text-text-muted hover:text-brand-green flex items-center gap-1 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to marketplace
      </Link>

      {/* Seller Header Card */}
      <div className="clay-card p-6 sm:p-8 bg-white flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt=""
            className="w-24 h-24 rounded-full object-cover border-2 border-border-subtle"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-green-soft text-brand-green font-extrabold text-3xl flex items-center justify-center border-2 border-emerald-200">
            {profile.name[0]}
          </div>
        )}

        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{profile.name}</h1>
            <div className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold bg-brand-green-soft px-3 py-1 rounded-full border border-emerald-200 mx-auto sm:mx-0">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              Verified Community Seller
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Member since{' '}
              {new Date(profile.createdAt).getFullYear()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> {profile.stats?.listingsCount || 0} items listed
            </span>
          </div>

          {profile.bio && (
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed max-w-2xl pt-1">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Active Listings by this user */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary">
          Active Listings by {profile.name} ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div className="clay-card p-12 text-center text-xs text-text-muted bg-white">
            This seller currently has no other active items for sale.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
