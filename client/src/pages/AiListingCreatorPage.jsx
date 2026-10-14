import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  RefreshCw,
  Tag,
  Loader2,
  Info,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { CompletenessMeter } from '../components/ui/CompletenessMeter.jsx';
import { MediaUploadZone } from '../components/ui/MediaUploadZone.jsx';

export function AiListingCreatorPage() {
  const navigate = useNavigate();

  // Raw notes state (Step 1)
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [knownDefects, setKnownDefects] = useState('');
  const [includedAccessories, setIncludedAccessories] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // AI Generation State
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiNotice, setAiNotice] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);

  // Review & Submit State (Step 2)
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await apiRequest('/categories');
      setCategories(res.categories || []);
    } catch (e) {
      console.warn(e);
    }
  }

  async function handleGenerateAI(e) {
    e.preventDefault();
    if (!productName.trim()) {
      setAiError('Please enter the name of the product you are selling.');
      return;
    }

    setGenerating(true);
    setAiError('');
    setAiNotice('');

    try {
      const data = await apiRequest('/ai/generate-listing', {
        method: 'POST',
        data: {
          productName,
          brand,
          model,
          condition,
          knownDefects,
          includedAccessories,
          additionalDetails,
        },
      });

      setGeneratedResult(data);
      if (data.notice) {
        setAiNotice(data.notice);
      }

      // Pre-fill editable review fields
      setTitle(data.title || '');
      setDescription(data.description || '');

      // Match suggested category to our categories list
      if (data.suggestedCategory && categories.length > 0) {
        const found = categories.find(
          (c) =>
            c.name.toLowerCase().includes(data.suggestedCategory.toLowerCase()) ||
            data.suggestedCategory.toLowerCase().includes(c.slug)
        );
        if (found) {
          setSelectedCategory(found.id);
        } else {
          setSelectedCategory(categories[0].id);
        }
      } else if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (err) {
      setAiError(err.message || 'AI generation failed. Please fill details manually.');
    } finally {
      setGenerating(false);
    }
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Validate 5MB and image types
    const validFiles = files.filter(
      (f) => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );

    if (validFiles.length < files.length) {
      alert('Some images were skipped because they exceeded 5MB or were not JPEG/PNG/WebP.');
    }

    setImages(validFiles.slice(0, 5));
    const previews = validFiles.slice(0, 5).map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  }

  async function handleFinalSubmit(isDraft = false) {
    if (!title.trim() || !description.trim() || !price || !selectedCategory) {
      setSubmitError('Please complete all required fields (title, description, price, category).');
      return;
    }

    if (Number(price) <= 0) {
      setSubmitError('Price must be greater than ₹0.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', String(price));
      formData.append('categoryId', selectedCategory);
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
      setSubmitError(err.message || 'Failed to submit listing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green-soft text-brand-green text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hosted AI Listing Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          AI Listing Creator
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Provide brief rough notes about what you are selling. ReLoop's hosted AI will craft an accurate, appealing secondhand description with suggested tags and categories for you to review and price.
        </p>
      </div>

      {!generatedResult ? (
        /* STEP 1: Input raw product notes */
        <form onSubmit={handleGenerateAI} className="clay-card p-6 sm:p-8 bg-white space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              required
              placeholder="e.g. iPhone 14 Pro, Sony Headphones, Office Chair"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Input
              label="Brand / Manufacturer (if known)"
              placeholder="e.g. Apple, Sony, IKEA, Herman Miller"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Exact Model / Variant (if known)"
              placeholder="e.g. 128GB Space Black, WH-1000XM4"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full clay-input p-2.5 text-xs bg-white font-medium"
              >
                <option value="NEW">Brand New / Sealed</option>
                <option value="LIKE_NEW">Like New (Mint / Barely Used)</option>
                <option value="GOOD">Good (Normal wear, fully functional)</option>
                <option value="FAIR">Fair (Noticeable cosmetic marks)</option>
                <option value="POOR">Needs Care / Partial Function</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Known Defects, Scratches or Wear"
              placeholder="e.g. Minor scratch on bezel, battery health 88%, original box has a small crease"
              rows={3}
              value={knownDefects}
              onChange={(e) => setKnownDefects(e.target.value)}
            />

            <Textarea
              label="Included Accessories & Bills"
              placeholder="e.g. Original charging cable, box, invoice, extra earpads included"
              rows={3}
              value={includedAccessories}
              onChange={(e) => setIncludedAccessories(e.target.value)}
            />
          </div>

          <Textarea
            label="Additional Notes / Selling Reason (Optional)"
            placeholder="e.g. Moving out of city, upgrading to newest model, barely used over weekends"
            rows={2}
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
          />

          {/* Product Photos in Step 1 */}
          <MediaUploadZone
            images={images}
            onChange={(newImages) => {
              setImages(newImages);
              setImagePreviews(newImages.map((f) => (f instanceof File || f instanceof Blob ? URL.createObjectURL(f) : f)));
            }}
            maxImages={5}
            label="Product Photos (Optional now, or add in Step 2)"
            sublabel="Snap the item with your camera or select from gallery"
          />

          {aiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-subtle">
            <p className="text-xs text-text-muted">
              🔒 Safe & Private: We never fabricate fake specifications or publish without your consent.
            </p>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              isLoading={generating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Listing with AI
            </Button>
          </div>
        </form>
      ) : (
        /* STEP 2: Review, edit, add price & photos, and publish */
        <div className="space-y-6">
          {aiNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{aiNotice}</span>
            </div>
          )}

          {/* Missing Details Advisory Banner from AI */}
          {generatedResult.missingDetailsToConsider &&
            generatedResult.missingDetailsToConsider.length > 0 && (
              <div className="clay-card p-4 bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-green uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Completeness Recommendations</span>
                </div>
                <ul className="text-xs text-text-primary space-y-1">
                  {generatedResult.missingDetailsToConsider.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-brand-green font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Editable Form */}
          <div className="clay-card p-6 sm:p-8 bg-white space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-bold text-base text-text-primary">
                Review & Edit Listing Details
              </h3>
              <button
                type="button"
                onClick={() => setGeneratedResult(null)}
                className="text-xs text-text-muted hover:text-brand-green flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start over
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Listing Title *"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1.5">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full clay-input p-2.5 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Your Asking Price (₹) *"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 15000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  icon={Tag}
                />
              </div>

              <Textarea
                label="Product Description *"
                rows={6}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Input
                label="Approximate Location / City"
                placeholder="e.g. Indiranagar, Bengaluru"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              {/* Photos Upload with Gallery and Camera Support in Step 2 */}
              <MediaUploadZone
                images={images}
                onChange={(newImages) => {
                  setImages(newImages);
                  setImagePreviews(newImages.map((f) => (f instanceof File || f instanceof Blob ? URL.createObjectURL(f) : f)));
                }}
                maxImages={5}
                label="Product Photos (Up to 5 images, max 5MB each)"
                sublabel="Choose from your gallery, upload from files, or take photos directly with camera"
              />
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => handleFinalSubmit(true)}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={submitting}
                onClick={() => handleFinalSubmit(false)}
              >
                Submit for Moderation Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
