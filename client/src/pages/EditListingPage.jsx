import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { AlertCircle, Tag, ArrowLeft, Trash2 } from 'lucide-react';

export function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [status, setStatus] = useState('ACTIVE');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadListing();
  }, [id]);

  async function loadListing() {
    setLoading(true);
    try {
      const data = await apiRequest(`/listings/${id}`);
      const l = data.listing;
      setTitle(l.title || '');
      setDescription(l.description || '');
      setPrice(String(l.price || ''));
      setCondition(l.condition || 'GOOD');
      setStatus(l.status || 'ACTIVE');
      setLocation(l.location || '');
    } catch (err) {
      setError(err.message || 'Could not load listing.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiRequest(`/listings/${id}`, {
        method: 'PUT',
        data: {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          condition,
          location: location.trim(),
        },
      });

      // Update status if changed
      if (status) {
        await apiRequest(`/listings/${id}/status`, {
          method: 'PATCH',
          data: { status },
        });
      }

      navigate(`/listing/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await apiRequest(`/listings/${id}`, { method: 'DELETE' });
      navigate('/seller/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-xs text-text-muted">Loading listing...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-text-muted hover:text-brand-green flex items-center gap-1 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Edit Listing</h1>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-1" /> Delete Listing
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="clay-card p-6 bg-white space-y-5">
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (₹)"
            type="number"
            min="1"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            icon={Tag}
          />

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full clay-input p-2.5 text-xs bg-white font-medium"
            >
              <option value="ACTIVE">Live (Active)</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="EXPIRED">Expired</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full clay-input p-2.5 text-xs bg-white font-medium"
          >
            <option value="NEW">Brand New / Sealed</option>
            <option value="LIKE_NEW">Like New</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Needs Care</option>
          </select>
        </div>

        <Textarea
          label="Description"
          rows={5}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-3 border-t border-border-subtle">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
