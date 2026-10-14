import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { apiRequest } from '../../lib/api.js';
import { Tag, AlertCircle } from 'lucide-react';

export function MakeOfferModal({ isOpen, onClose, listing, onOfferSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!listing) return null;

  const askingPrice = Number(listing.price);

  function applyDiscount(percent) {
    const discounted = Math.round(askingPrice * (1 - percent / 100));
    setAmount(String(discounted));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid offer amount greater than ₹0.');
      return;
    }

    if (numAmount >= askingPrice) {
      setError(`Your offer must be lower than the asking price of ₹${askingPrice.toLocaleString()}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/offers', {
        method: 'POST',
        data: {
          listingId: listing.id,
          amount: numAmount,
        },
      });

      if (onOfferSuccess) {
        onOfferSuccess(data.offer);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Make an Offer">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Listing Mini Summary */}
        <div className="flex items-center gap-3 p-3 bg-background-secondary rounded-xl">
          <div className="w-12 h-12 rounded-lg bg-border-subtle overflow-hidden shrink-0">
            {listing.images && listing.images[0] && (
              <img
                src={listing.images[0].url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-text-primary truncate">{listing.title}</h4>
            <p className="text-sm font-extrabold text-brand-green">
              Asking Price: ₹{askingPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quick Offer Chips */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-2">
            Quick Offer Suggestions:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((pct) => {
              const val = Math.round(askingPrice * (1 - pct / 100));
              return (
                <button
                  type="button"
                  key={pct}
                  onClick={() => applyDiscount(pct)}
                  className="py-2 px-2 text-xs font-bold border border-border-subtle rounded-xl hover:border-brand-green hover:bg-brand-green-soft text-text-primary transition-colors text-center"
                >
                  <span className="block text-[10px] text-text-muted">-{pct}%</span>
                  ₹{val.toLocaleString()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Price Input */}
        <div>
          <Input
            label="Your Offer Amount (₹)"
            type="number"
            min="1"
            max={askingPrice - 1}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder={`e.g. ${Math.round(askingPrice * 0.9)}`}
            icon={Tag}
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={loading}
          >
            Send Offer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
