import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  History,
  Bookmark,
  Trash2,
  Search,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { ListingCard } from '../components/marketplace/ListingCard.jsx';
import { Button } from '../components/ui/Button.jsx';

export function SavedListingsPage() {
  const [tab, setTab] = useState('saved'); // 'saved', 'recent', 'searches'
  const [savedListings, setSavedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [savedRes, recentRes, searchesRes] = await Promise.all([
        apiRequest('/saved'),
        apiRequest('/saved/recently-viewed'),
        apiRequest('/saved/searches'),
      ]);

      setSavedListings(savedRes.listings || []);
      setRecentListings(recentRes.listings || []);
      setSavedSearches(searchesRes.searches || []);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }

  function handleUnsave(id) {
    setSavedListings((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleDeleteSearch(id) {
    try {
      await apiRequest(`/saved/searches/${id}`, { method: 'DELETE' });
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message || 'Could not delete search.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Saved & Bookmarks
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review saved products, recently viewed items, and your alert searches
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-4">
        <button
          onClick={() => setTab('saved')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            tab === 'saved'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Heart className="w-4 h-4" />
          Saved Listings ({savedListings.length})
        </button>

        <button
          onClick={() => setTab('recent')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            tab === 'recent'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <History className="w-4 h-4" />
          Recently Viewed ({recentListings.length})
        </button>

        <button
          onClick={() => setTab('searches')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
            tab === 'searches'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Searches ({savedSearches.length})
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading your saved items...</p>
        </div>
      ) : tab === 'saved' ? (
        savedListings.length === 0 ? (
          <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
            <Heart className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="font-bold text-text-primary">No saved listings</h3>
            <p className="text-xs text-text-muted">
              Click the heart icon on any product to save it here for later and track price drops.
            </p>
            <Link to="/browse">
              <Button size="sm" variant="secondary">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {savedListings.map((item) => (
              <ListingCard key={item.id} listing={item} onUnsave={handleUnsave} />
            ))}
          </div>
        )
      ) : tab === 'recent' ? (
        recentListings.length === 0 ? (
          <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
            <History className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="font-bold text-text-primary">No recently viewed items</h3>
            <p className="text-xs text-text-muted">
              Items you browse on ReLoop will be remembered here so you can easily find them again.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )
      ) : (
        /* Saved Searches */
        savedSearches.length === 0 ? (
          <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
            <Bookmark className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="font-bold text-text-primary">No saved searches</h3>
            <p className="text-xs text-text-muted">
              Save search queries on the Browse page to quickly re-run them anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {savedSearches.map((s) => (
              <div
                key={s.id}
                className="clay-card p-4 bg-white flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-green-soft text-brand-green flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                      {s.name || s.query || 'Custom Search'}
                    </h4>
                    <p className="text-[11px] text-text-muted">
                      Saved on {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/browse?${s.query ? `search=${encodeURIComponent(s.query)}` : ''}`}
                  >
                    <Button size="sm" variant="outline">
                      Run Search <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleDeleteSearch(s.id)}
                    className="p-2 text-text-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
