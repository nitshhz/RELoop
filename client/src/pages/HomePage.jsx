import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Zap,
  Repeat,
  Tag,
  Loader2,
  X,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { ListingCard } from '../components/marketplace/ListingCard.jsx';
import { CategoryPills } from '../components/marketplace/CategoryPills.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [priceDrops, setPriceDrops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    return localStorage.getItem('reloop_welcome_dismissed') === 'true';
  });

  function dismissWelcome() {
    setWelcomeDismissed(true);
    localStorage.setItem('reloop_welcome_dismissed', 'true');
  }

  useEffect(() => {
    loadHomeData();
  }, [selectedCategory]);

  async function loadHomeData() {
    setLoading(true);
    try {
      const [catsRes, listingsRes] = await Promise.all([
        apiRequest('/categories'),
        apiRequest('/listings', {
          params: {
            limit: 8,
            ...(selectedCategory && { categoryId: selectedCategory }),
          },
        }),
      ]);

      setCategories(catsRes.categories || []);
      const items = listingsRes.listings || [];
      setRecentListings(items);

      // Filter listings with price drops
      const drops = items.filter(
        (item) => item.originalPrice && item.originalPrice > item.price
      );
      setPriceDrops(drops);
    } catch (err) {
      console.warn('Failed loading home data:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  }

  return (
    <div className="space-y-12 pb-12">
      {/* First-Time Visitor Welcome Banner */}
      {!user && !welcomeDismissed && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="clay-card bg-emerald-50/90 border border-emerald-200/80 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                  Welcome to ReLoop Marketplace!
                </h3>
                <p className="text-xs text-emerald-800/90 max-w-2xl leading-relaxed">
                  Buy smarter, sell easier, and waste less. Create an account or sign in to start making offers, messaging verified sellers, and publishing your pre-owned items.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="sm" variant="primary" className="w-full sm:w-auto shadow-clay-button font-bold">
                  Create Account
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="sm" variant="secondary" className="w-full sm:w-auto font-bold">
                  Sign In
                </Button>
              </Link>
              <button
                onClick={dismissWelcome}
                title="Dismiss message"
                className="text-emerald-700 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100 transition-colors ml-1 hidden sm:block"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="clay-card bg-gradient-to-br from-white via-[#FDFBF7] to-[#F3EFE6] p-6 sm:p-12 lg:p-16 relative overflow-hidden border border-border-subtle">
            {/* Background Accent Graphics */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-green-soft/40 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-orange-100/30 blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-soft border border-emerald-200 text-brand-green text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Secondhand Resale</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.15]">
                Buy smarter. Sell easier.{' '}
                <span className="text-brand-green">Waste less.</span>
              </h1>

              <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">
                ReLoop gives electronics, furniture, books, and lifestyle goods a second life with verified listings, built-in offers, quick buyer-seller chat, and AI-powered listing tools.
              </p>

              {/* First-time / Unauthenticated visitor CTA buttons */}
              {!user && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-clay-button flex items-center justify-center gap-2 font-bold">
                      Create Free Account <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto flex items-center justify-center font-bold">
                      Sign In
                    </Button>
                  </Link>
                  <span className="text-xs text-text-muted hidden md:inline-block pl-2">
                    Free peer-to-peer circular resale
                  </span>
                </div>
              )}

              {/* Big Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-text-muted absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for today? (e.g. iPhone, Desk, PS5)"
                    className="w-full clay-input pl-12 pr-4 py-3 text-sm sm:text-base bg-white"
                  />
                </div>
                <Button type="submit" size="lg" variant="primary" className="shrink-0">
                  Search Items
                </Button>
              </form>

              {/* Quick Popular Keywords */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted pt-1">
                <span className="font-semibold text-text-primary">Popular searches:</span>
                {['iPhone', 'Sony Headphones', 'Office Chair', 'MacBook', 'PS5'].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => navigate(`/browse?search=${encodeURIComponent(kw)}`)}
                    className="px-2.5 py-1 rounded-lg bg-background-secondary hover:bg-border-subtle text-text-primary font-medium transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Listing Creator Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="clay-card p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-[#1e3c2d] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold backdrop-blur-sm border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart AI Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Selling something? Let AI write your listing in seconds.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Just enter your product name and rough condition notes. Our hosted AI creates a structured, appealing description, tags, and suggested categories ready for you to review and publish.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link to={user ? '/ai-creator' : '/login'} className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow-md hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Try AI Listing Creator
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">
            Explore by Category
          </h2>
          <Link
            to="/browse"
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <CategoryPills
          categories={categories}
          selectedId={selectedCategory}
          onSelect={(id) => setSelectedCategory(id)}
        />
      </section>

      {/* Recently Reduced / Price Drops Section */}
      {priceDrops.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-terracotta flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                Recently Reduced Prices
              </h2>
            </div>
            <Link
              to="/browse?sortBy=price_asc"
              className="text-xs font-bold text-terracotta hover:underline"
            >
              See deals →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {priceDrops.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Fresh Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">
              Fresh Listings
            </h2>
            <p className="text-xs text-text-muted">
              Recently approved pre-owned items from trusted local sellers
            </p>
          </div>
          <Link
            to="/browse"
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            Explore marketplace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading available listings...</p>
          </div>
        ) : recentListings.length === 0 ? (
          <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3">
            <Tag className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="font-bold text-text-primary">No listings found</h3>
            <p className="text-xs text-text-muted">
              There are currently no active listings in this category. Be the first to sell!
            </p>
            <Link to="/sell">
              <Button size="sm" variant="primary">
                Create First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Why ReLoop Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="clay-card p-6 space-y-2 bg-white">
            <div className="w-10 h-10 rounded-xl bg-brand-green-soft text-brand-green flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary">
              Built-in Offers & Counters
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              No awkward haggling. Buyers can propose structured offers, and sellers can counter or accept with one click with complete transactional protection.
            </p>
          </div>

          <div className="clay-card p-6 space-y-2 bg-white">
            <div className="w-10 h-10 rounded-xl bg-brand-green-soft text-brand-green flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary">
              Moderated Quality Listings
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Every listing is reviewed by administrators for authentic photos, transparent condition disclosure, and prohibited item compliance before going live.
            </p>
          </div>

          <div className="clay-card p-6 space-y-2 bg-white">
            <div className="w-10 h-10 rounded-xl bg-brand-green-soft text-brand-green flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-text-primary">
              Price-Drop Alerts & Saved Searches
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Save your favorite items and searches. When a seller discounts an item you like, ReLoop sends you an instant in-app notification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
