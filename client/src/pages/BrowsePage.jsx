import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  BookmarkPlus,
  ArrowUpDown,
  Loader2,
  Tag,
  Check,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { ListingCard } from '../components/marketplace/ListingCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [savedSearchSuccess, setSavedSearchSuccess] = useState(false);

  // Filter state
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const condition = searchParams.get('condition') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadListings();
  }, [searchParams]);

  async function loadCategories() {
    try {
      const res = await apiRequest('/categories');
      setCategories(res.categories || []);
    } catch (e) {
      console.warn('Error loading categories:', e.message);
    }
  }

  async function loadListings() {
    setLoading(true);
    try {
      const res = await apiRequest('/listings', {
        params: {
          search,
          categoryId,
          condition,
          minPrice,
          maxPrice,
          sortBy,
          page,
          limit: 12,
        },
      });

      setListings(res.listings || []);
      setTotalListings(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.warn('Error fetching listings:', e.message);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key, val) {
    const next = new URLSearchParams(searchParams);
    if (val !== undefined && val !== null && val !== '') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  }

  function clearAllFilters() {
    setSearchParams(new URLSearchParams());
  }

  async function handleSaveSearch() {
    if (!user) {
      alert('Please log in to save searches and receive alerts.');
      return;
    }
    try {
      await apiRequest('/saved/searches', {
        method: 'POST',
        data: {
          name: search ? `Search: "${search}"` : 'Marketplace Search',
          query: search || null,
          filters: { categoryId, condition, minPrice, maxPrice },
        },
      });
      setSavedSearchSuccess(true);
      setTimeout(() => setSavedSearchSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Could not save search.');
    }
  }

  const activeFiltersCount = [categoryId, condition, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Browse Secondhand Goods
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Showing <strong className="text-text-primary">{totalListings}</strong> verified available items
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateFilter('search', e.target.value.trim());
              }}
              placeholder="Search in listings..."
              className="w-full clay-input pl-10 pr-4 py-2 text-xs bg-white"
            />
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border-subtle text-xs font-bold shrink-0 min-h-[40px]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block clay-card p-5 space-y-6 bg-white sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-text-primary">
              <Filter className="w-4 h-4 text-brand-green" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-green text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-brand-green hover:underline font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">Category</label>
            <select
              value={categoryId}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="w-full clay-input p-2 text-xs bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.listingsCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">Condition</label>
            <select
              value={condition}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="w-full clay-input p-2 text-xs bg-white"
            >
              <option value="">Any Condition</option>
              <option value="NEW">Brand New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Needs Care</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full clay-input p-2 text-xs bg-white"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full clay-input p-2 text-xs bg-white"
              />
            </div>
          </div>

          {/* Save Search Button */}
          <div className="pt-2">
            <button
              onClick={handleSaveSearch}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-brand-green/60 text-brand-green hover:bg-brand-green-soft text-xs font-bold transition-colors"
            >
              {savedSearchSuccess ? (
                <>
                  <Check className="w-4 h-4 text-brand-green" />
                  Search Saved!
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  Save Search & Alerts
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Listings Content Column */}
        <div className="md:col-span-3 space-y-6">
          {/* Sort bar & Active filter chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-border-subtle">
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-background-secondary text-text-primary font-medium">
                  Keyword: "{search}"
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-red-600"
                    onClick={() => updateFilter('search', '')}
                  />
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-background-secondary text-text-primary font-medium">
                  {categories.find((c) => c.id === categoryId)?.name || 'Category'}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-red-600"
                    onClick={() => updateFilter('categoryId', '')}
                  />
                </span>
              )}
              {condition && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-background-secondary text-text-primary font-medium">
                  Condition: {condition}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-red-600"
                    onClick={() => updateFilter('condition', '')}
                  />
                </span>
              )}
            </div>

            {/* Sort by Dropdown */}
            <div className="flex items-center gap-2 text-xs ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-text-muted font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="clay-input py-1 px-2 text-xs bg-white font-semibold"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
              <p className="text-xs text-text-muted">Filtering marketplace listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
              <Tag className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="font-bold text-text-primary">No listings match your criteria</h3>
              <p className="text-xs text-text-muted">
                Try widening your search terms, clearing filters, or resetting price thresholds.
              </p>
              <Button size="sm" variant="secondary" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {listings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => updateFilter('page', page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-bold px-3 py-1 bg-white border border-border-subtle rounded-lg">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= totalPages}
                    onClick={() => updateFilter('page', page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-text-primary/50 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-bold text-sm text-text-primary">Filter Marketplace</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => updateFilter('categoryId', e.target.value)}
                  className="w-full clay-input p-2 text-xs bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => updateFilter('condition', e.target.value)}
                  className="w-full clay-input p-2 text-xs bg-white"
                >
                  <option value="">Any Condition</option>
                  <option value="NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Needs Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    defaultValue={minPrice}
                    onBlur={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full clay-input p-2 text-xs bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    defaultValue={maxPrice}
                    onBlur={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full clay-input p-2 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
