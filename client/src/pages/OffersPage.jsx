import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Loader2,
  AlertCircle,
  Repeat,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';

export function OffersPage() {
  const [tab, setTab] = useState('received'); // 'received' or 'sent'
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorNotice, setErrorNotice] = useState('');

  // Counter Modal State
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    try {
      const data = await apiRequest('/offers/my-offers');
      setReceivedOffers(data.receivedOffers || []);
      setSentOffers(data.sentOffers || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(offerId, action, counterVal = null) {
    setActionLoadingId(offerId);
    setErrorNotice('');
    try {
      await apiRequest(`/offers/${offerId}/respond`, {
        method: 'POST',
        data: {
          action,
          ...(counterVal && { counterAmount: Number(counterVal) }),
        },
      });
      await loadOffers();
    } catch (err) {
      setErrorNotice(err.message || 'Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleWithdraw(offerId) {
    if (!window.confirm('Are you sure you want to withdraw this offer?')) return;
    setActionLoadingId(offerId);
    setErrorNotice('');
    try {
      await apiRequest(`/offers/${offerId}/withdraw`, { method: 'POST' });
      await loadOffers();
    } catch (err) {
      setErrorNotice(err.message || 'Could not withdraw offer.');
    } finally {
      setActionLoadingId(null);
    }
  }

  function openCounterModal(offer) {
    setActiveOffer(offer);
    setCounterAmount(String(offer.listing.price || ''));
    setCounterModalOpen(true);
  }

  async function submitCounter(e) {
    e.preventDefault();
    if (!activeOffer || !counterAmount || Number(counterAmount) <= 0) return;
    setCounterModalOpen(false);
    await handleRespond(activeOffer.id, 'COUNTER', counterAmount);
  }

  const currentList = tab === 'received' ? receivedOffers : sentOffers;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Offers & Counteroffers
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Review incoming negotiations from buyers or track offers you have sent
        </p>
      </div>

      {errorNotice && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-4">
        <button
          onClick={() => setTab('received')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${
            tab === 'received'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Received Offers ({receivedOffers.length})
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${
            tab === 'sent'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Sent Offers ({sentOffers.length})
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-brand-green animate-spin mx-auto mb-2" />
          <p className="text-xs text-text-muted">Loading your offers...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="clay-card p-12 text-center max-w-md mx-auto space-y-3 bg-white">
          <Tag className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="font-bold text-text-primary">
            No {tab === 'received' ? 'received' : 'sent'} offers yet
          </h3>
          <p className="text-xs text-text-muted">
            {tab === 'received'
              ? 'When buyers submit an offer on your listings, they will appear here.'
              : 'You have not submitted an offer on any products yet.'}
          </p>
          <Link to="/browse">
            <Button size="sm" variant="secondary">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((offer) => {
            const isReceived = tab === 'received';
            const listing = offer.listing;
            const otherParty = isReceived ? offer.buyer : offer.seller;

            return (
              <div
                key={offer.id}
                className="clay-card p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Product & Party Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-background-secondary overflow-hidden shrink-0 border border-border-subtle">
                    {listing.images && listing.images[0] ? (
                      <img
                        src={listing.images[0].url}
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
                    <Link
                      to={`/listing/${listing.id}`}
                      className="font-bold text-sm text-text-primary hover:text-brand-green line-clamp-1 truncate"
                    >
                      {listing.title}
                    </Link>

                    <p className="text-xs text-text-muted mt-0.5">
                      {isReceived ? 'Buyer' : 'Seller'}:{' '}
                      <strong className="text-text-primary">{otherParty?.name}</strong>
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">Asking: ₹{listing.price?.toLocaleString()}</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs font-bold text-brand-green">
                        Offered: ₹{offer.amount?.toLocaleString()}
                      </span>
                      {offer.counterAmount && (
                        <>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs font-bold text-terracotta">
                            Counter: ₹{offer.counterAmount?.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                  <div className="text-right">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        offer.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-brand-green'
                          : offer.status === 'COUNTERED'
                          ? 'bg-orange-100 text-terracotta'
                          : offer.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : offer.status === 'WITHDRAWN'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Seller Actions on PENDING */}
                    {isReceived && offer.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={actionLoadingId === offer.id}
                          onClick={() => handleRespond(offer.id, 'ACCEPT')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoadingId === offer.id}
                          onClick={() => openCounterModal(offer)}
                        >
                          Counter
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoadingId === offer.id}
                          onClick={() => handleRespond(offer.id, 'REJECT')}
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {/* Buyer Actions on COUNTERED */}
                    {!isReceived && offer.status === 'COUNTERED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={actionLoadingId === offer.id}
                        onClick={() => handleRespond(offer.id, 'ACCEPT')}
                      >
                        Accept Counter ₹{offer.counterAmount?.toLocaleString()}
                      </Button>
                    )}

                    {/* Buyer Withdraw action on pending offer */}
                    {!isReceived && (offer.status === 'PENDING' || offer.status === 'COUNTERED') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionLoadingId === offer.id}
                        onClick={() => handleWithdraw(offer.id)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      <Modal
        isOpen={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title="Propose Counter-Offer"
      >
        <form onSubmit={submitCounter} className="space-y-4">
          <p className="text-xs text-text-muted">
            Suggest a price between the buyer's offer (₹
            {activeOffer?.amount?.toLocaleString()}) and your asking price (₹
            {activeOffer?.listing?.price?.toLocaleString()}).
          </p>

          <Input
            label="Counter-Offer Price (₹)"
            type="number"
            min="1"
            required
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="e.g. 13500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCounterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Counter-Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
