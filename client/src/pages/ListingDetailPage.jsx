import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  Flag,
  MessageSquare,
  Tag,
  MapPin,
  Calendar,
  CheckCircle,
  ShieldCheck,
  TrendingDown,
  Edit,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ConditionBadge, StatusBadge } from '../components/ui/Badge.jsx';
import { MakeOfferModal } from '../components/marketplace/MakeOfferModal.jsx';
import { ReportModal } from '../components/marketplace/ReportModal.jsx';
import { ShareModal } from '../components/marketplace/ShareModal.jsx';
import { ListingCard } from '../components/marketplace/ListingCard.jsx';
import { CompletenessMeter } from '../components/ui/CompletenessMeter.jsx';

export function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [offerSuccessNotice, setOfferSuccessNotice] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  async function loadListing() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/listings/${id}`);
      setListing(data.listing);
      setSimilar(data.similar || []);
      setIsSaved(data.isSaved || false);
      setActiveImageIdx(0);
    } catch (err) {
      setError(err.message || 'Listing could not be loaded.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSave() {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await apiRequest('/saved/toggle', {
        method: 'POST',
        data: { listingId: listing.id },
      });
      setIsSaved(res.isSaved);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStartChat() {
    if (!user) {
      navigate('/login');
      return;
    }
    setChatLoading(true);
    try {
      const res = await apiRequest('/conversations', {
        method: 'POST',
        data: { listingId: listing.id },
      });
      navigate(`/messages/${res.conversation.id}`);
    } catch (err) {
      alert(err.message || 'Could not initiate conversation.');
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-text-muted">Loading product details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Flag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Listing Unavailable</h2>
        <p className="text-xs text-text-muted">
          {error || 'This listing may have been sold, removed, or is awaiting administrator approval.'}
        </p>
        <Link to="/browse">
          <Button variant="primary" size="sm">
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === listing.sellerId;
  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : [{ url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80' }];

  const hasPriceDrop = listing.originalPrice && listing.originalPrice > listing.price;
  const discountPercent = hasPriceDrop
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Link to="/browse" className="hover:text-brand-green flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to browse
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium truncate">{listing.title}</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Photo Card */}
          <div className="relative aspect-[4/3] w-full clay-card overflow-hidden bg-background-secondary">
            <img
              src={images[activeImageIdx]?.url}
              alt={listing.title}
              className="w-full h-full object-contain sm:object-cover"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <ConditionBadge condition={listing.condition} />
              {hasPriceDrop && (
                <span className="inline-flex items-center gap-1 bg-terracotta text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {discountPercent}% Price Drop
                </span>
              )}
            </div>

            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={() => setShareModalOpen(true)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary hover:scale-105 active:scale-95 transition-all"
                title="Share Listing"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleSave}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary hover:scale-105 active:scale-95 transition-all"
                title={isSaved ? 'Remove from saved' : 'Save listing'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isSaved ? 'fill-red-500 text-red-500' : 'text-text-primary'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIdx === idx
                      ? 'border-brand-green scale-105 shadow-md'
                      : 'border-border-subtle opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Specifications Table */}
          {listing.specifications && Object.keys(listing.specifications).length > 0 && (
            <div className="clay-card p-6 bg-white space-y-3">
              <h3 className="font-bold text-sm text-text-primary">Product Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {Object.entries(listing.specifications).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-background-secondary/60 text-xs">
                    <span className="text-text-muted block font-medium">{key}</span>
                    <span className="text-text-primary font-bold">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description Card */}
          <div className="clay-card p-6 bg-white space-y-3">
            <h3 className="font-bold text-sm text-text-primary">Item Description</h3>
            <div className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line font-normal">
              {listing.description}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Actions & Seller Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Main Price & Title Card */}
          <div className="clay-card p-6 bg-white space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {listing.category?.name || 'Secondhand'}
                </span>
                <div className="flex items-center gap-1.5">
                  {listing.moderationReason && listing.moderationReason.includes('Auto-approved') && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-brand-green text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI Verified
                    </span>
                  )}
                  <StatusBadge status={listing.status} />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight leading-snug">
                {listing.title}
              </h1>
            </div>

            {/* Price section */}
            <div className="p-4 bg-background-secondary/60 rounded-2xl flex items-baseline justify-between border border-border-subtle">
              <div>
                <span className="text-xs text-text-muted block font-semibold mb-0.5">
                  Asking Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-brand-green tracking-tight">
                    ₹{Number(listing.price).toLocaleString()}
                  </span>
                  {hasPriceDrop && (
                    <span className="text-sm text-text-muted line-through font-medium">
                      ₹{Number(listing.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-text-muted">
                <span>Listed on:</span>
                <p className="font-semibold text-text-primary">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Success notification for offer */}
            {offerSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
                <span>Your offer has been sent to the seller! Check your Offers tab for updates.</span>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {isOwner ? (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted text-center font-medium">
                    You are the seller of this listing.
                  </p>
                  <Link to={`/listing/${listing.id}/edit`} className="block">
                    <Button variant="secondary" className="w-full">
                      <Edit className="w-4 h-4 mr-1.5" />
                      Edit Listing Details
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={listing.status !== 'ACTIVE'}
                    onClick={() => {
                      if (!user) navigate('/login');
                      else setOfferModalOpen(true);
                    }}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Make an Offer
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    isLoading={chatLoading}
                    onClick={handleStartChat}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Seller
                  </Button>
                </>
              )}
            </div>

            {/* Location & Safety reassurance */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {listing.location || 'Local area'}
              </span>
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-text-muted hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Listing
              </button>
            </div>
          </div>

          {/* Completeness Meter */}
          <CompletenessMeter
            score={listing.completenessScore || 85}
            tips={[
              'Includes clear photos and transparent wear details',
              'Seller verified with active account',
            ]}
          />

          {/* Seller Profile Card */}
          <div className="clay-card p-5 bg-white space-y-3">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Seller Profile
            </h4>
            <div className="flex items-center gap-3">
              {listing.seller?.avatar ? (
                <img
                  src={listing.seller.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-border-subtle"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-green-soft text-brand-green font-extrabold flex items-center justify-center text-base">
                  {listing.seller?.name?.[0] || 'S'}
                </div>
              )}
              <div className="truncate">
                <h5 className="font-bold text-sm text-text-primary truncate">
                  {listing.seller?.name}
                </h5>
                <p className="text-xs text-text-muted">
                  Member since {new Date(listing.seller?.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            {listing.seller?.bio && (
              <p className="text-xs text-text-muted italic border-l-2 border-brand-green-soft pl-2.5">
                "{listing.seller.bio}"
              </p>
            )}

            <div className="pt-2 border-t border-border-subtle flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Complies with ReLoop Community Resale Standards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings Carousel / Grid */}
      {similar.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">
              Similar {listing.category?.name} Listings
            </h2>
            <Link
              to={`/browse?categoryId=${listing.categoryId}`}
              className="text-xs font-bold text-brand-green hover:underline"
            >
              See more →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similar.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <MakeOfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        listing={listing}
        onOfferSuccess={() => {
          setOfferSuccessNotice(true);
          setTimeout(() => setOfferSuccessNotice(false), 5000);
        }}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="LISTING"
        targetId={listing.id}
        targetTitle={listing.title}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={listing.title}
        url={window.location.href}
      />
    </div>
  );
}
