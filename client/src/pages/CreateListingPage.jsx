import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Sparkles,
  Tag,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { CompletenessMeter } from '../components/ui/CompletenessMeter.jsx';

export function CreateListingPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Price suggestions state
  const [priceInsights, setPriceInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await apiRequest('/categories');
      setCategories(res.categories || []);
      if (res.categories && res.categories.length > 0) {
        setCategoryId(res.categories[0].id);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Fetch price suggestion when category or brand changes
  useEffect(() => {
    if (!categoryId) return;
    const timer = setTimeout(async () => {
      setInsightsLoading(true);
      try {
        const res = await apiRequest('/price/suggestions', {
          params: { categoryId, brand, condition },
        });
        setPriceInsights(res);
      } catch {
        setPriceInsights(null);
      } finally {
        setInsightsLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [categoryId, brand, condition]);

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const validFiles = files.filter(
      (f) => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );

    setImages(validFiles.slice(0, 5));
    setImagePreviews(validFiles.slice(0, 5).map((f) => URL.createObjectURL(f)));
  }

  // Calculate live completeness score
  const completenessScore =
    (title.length >= 5 ? 15 : 0) +
    (description.length >= 30 ? 20 : 0) +
    (Number(price) > 0 ? 15 : 0) +
    (categoryId ? 10 : 0) +
    (condition ? 10 : 0) +
    (brand || model ? 10 : 0) +
    (location ? 5 : 0) +
    (images.length >= 1 ? 10 : 0) +
    (images.length >= 3 ? 5 : 0);

  async function handleSubmit(isDraft = false) {
    if (!title.trim() || !description.trim() || !price || !categoryId) {
      setError('Please fill in title, description, category, and price.');
      return;
    }

    if (Number(price) <= 0) {
      setError('Price must be greater than ₹0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', String(price));
      formData.append('categoryId', categoryId);
      formData.append('condition', condition);
      if (brand) formData.append('brand', brand.trim());
      if (model) formData.append('model', model.trim());
      if (location) formData.append('location', location.trim());
      formData.append('isDraft', String(isDraft));

      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await apiRequest('/listings', {
        method: 'POST',
        data: formData,
        isFormData: true,
      });

      navigate(`/listing/${res.listing.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit listing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with AI shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Create Secondhand Listing
          </h1>
          <p className="text-xs text-text-muted mt-1">
            List your item on ReLoop for verified local buyers
          </p>
        </div>

        <Link to="/ai-creator">
          <Button variant="outline" size="sm" className="border-emerald-200 text-brand-green bg-brand-green-soft hover:bg-emerald-100">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-green" />
            Switch to AI Listing Creator
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form (8 cols) */}
        <div className="lg:col-span-8 clay-card p-6 sm:p-8 bg-white space-y-6">
          <Input
            label="Listing Title *"
            required
            placeholder="e.g. Sony WH-1000XM4 Wireless Headphones (Silver)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full clay-input p-2.5 text-xs bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full clay-input p-2.5 text-xs bg-white"
              >
                <option value="NEW">Brand New / Sealed</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good (Normal wear)</option>
                <option value="FAIR">Fair (Visible scuffs)</option>
                <option value="POOR">Needs Care</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand (Optional)"
              placeholder="e.g. Apple, Sony, IKEA"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <Input
              label="Model (Optional)"
              placeholder="e.g. WH-1000XM4, iPhone 14"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <Input
            label="Asking Price (₹) *"
            type="number"
            min="1"
            required
            placeholder="e.g. 14500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            icon={Tag}
          />

          <Textarea
            label="Description & Wear Details *"
            rows={5}
            required
            placeholder="Describe the item's condition, usage history, included cables/boxes, reason for selling..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Approximate Neighborhood or City"
            placeholder="e.g. Koramangala, Bengaluru"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {/* Photo Uploader */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-primary">
              Upload Product Photos (Up to 5 images, max 5MB each)
            </label>
            <div className="border-2 border-dashed border-border-subtle rounded-2xl p-6 text-center hover:bg-background-secondary/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-xs font-bold text-text-primary">
                Click or drag & drop photos here
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                PNG, JPEG, WebP up to 5MB
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="flex items-center gap-3 pt-2 overflow-x-auto">
                {imagePreviews.map((url, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-xl overflow-hidden border border-border-subtle shrink-0"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => handleSubmit(true)}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={loading}
              onClick={() => handleSubmit(false)}
            >
              Publish for Moderation
            </Button>
          </div>
        </div>

        {/* Right Guidance Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Completeness Meter */}
          <CompletenessMeter
            score={completenessScore}
            tips={[
              'Add clear photos of any imperfections',
              'Specify exact brand and model for faster search discovery',
              'Fair pricing attracts 3x more offers',
            ]}
          />

          {/* Data-Driven Price Insights Card */}
          <div className="clay-card p-5 bg-white space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary uppercase tracking-wider">
              <Tag className="w-4 h-4 text-brand-green" />
              <span>Marketplace Price Insights</span>
            </div>

            {insightsLoading ? (
              <p className="text-xs text-text-muted">Calculating market averages...</p>
            ) : priceInsights?.suggestedRange ? (
              <div className="space-y-2 p-3 bg-background-secondary rounded-xl text-xs">
                <span className="text-text-muted block">Comparable Active Range:</span>
                <p className="text-base font-extrabold text-brand-green">
                  ₹{priceInsights.suggestedRange.min.toLocaleString()} – ₹
                  {priceInsights.suggestedRange.max.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-muted">
                  Average: ₹{priceInsights.suggestedRange.average.toLocaleString()} ({priceInsights.count} items)
                </p>
                <p className="text-[10px] text-text-muted italic pt-1">
                  {priceInsights.explanation}
                </p>
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                {priceInsights?.message || 'Select a category to view benchmark pricing.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
