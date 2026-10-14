import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Sparkles, TrendingDown } from 'lucide-react';
import { ConditionBadge, StatusBadge } from '../ui/Badge.jsx';
import { apiRequest } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function ListingCard({ listing, onUnsave }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(listing.isSaved || false);
  const [saving, setSaving] = useState(false);

  const primaryImage =
    listing.images && listing.images.length > 0
      ? listing.images[0].url
      : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';

  const hasPriceDrop = listing.originalPrice && listing.originalPrice > listing.price;
  const discountPercent = hasPriceDrop
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;

  async function handleToggleSave(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const data = await apiRequest('/saved/toggle', {
        method: 'POST',
        data: { listingId: listing.id },
      });
      setIsSaved(data.isSaved);
      if (!data.isSaved && onUnsave) {
        onUnsave(listing.id);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group block clay-card-interactive overflow-hidden flex flex-col h-full bg-white"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full bg-background-secondary overflow-hidden">
        <img
          src={primaryImage}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <ConditionBadge condition={listing.condition} />
          {hasPriceDrop && (
            <span className="inline-flex items-center gap-1 bg-terracotta text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-sm">
              <TrendingDown className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Save Favorite Button */}
        <button
          onClick={handleToggleSave}
          disabled={saving}
          aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary hover:text-red-500 hover:scale-110 active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-red-500 text-red-500' : 'text-text-primary'
            }`}
          />
        </button>

        {listing.status && listing.status !== 'ACTIVE' && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <StatusBadge status={listing.status} />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Price & Original Price */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-xl font-extrabold text-text-primary tracking-tight">
              ₹{Number(listing.price).toLocaleString()}
            </span>
            {hasPriceDrop && (
              <span className="text-xs text-text-muted line-through font-medium">
                ₹{Number(listing.originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-snug group-hover:text-brand-green transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Footer Meta */}
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3 h-3 shrink-0 text-text-muted" />
            <span className="truncate">{listing.location || 'Local area'}</span>
          </div>
          <span className="shrink-0 font-medium">
            {new Date(listing.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
