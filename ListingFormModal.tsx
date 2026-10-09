import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  BookOpen,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Search,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Listing, CATEGORIES, CategoryType } from '../types/marketplace';
import { api } from '../services/api';

interface ListingFormModalProps {
  isOpen: boolean;
  listingToEdit?: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_IMAGES = [
  { label: 'Engineering Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Scientific Calculator', url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80' },
  { label: 'Engineering Drafter', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
  { label: 'Campus Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Hostel Study Table', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
  { label: 'Workshop Lab Coat', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
  { label: 'Tech & Electronics', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' }
];

export const ListingFormModal: React.FC<ListingFormModalProps> = ({
  isOpen,
  listingToEdit,
  onClose,
  onSuccess
}) => {
  const isEditing = Boolean(listingToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<string>('Textbooks & Notes');
  const [condition, setCondition] = useState<'Like New' | 'Good' | 'Fair'>('Good');
  const [imageUrl, setImageUrl] = useState('');
  const [campusLocation, setCampusLocation] = useState('');

  // Book search helper states (Open Library External API)
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);

  // Validation & UI states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (listingToEdit) {
      setTitle(listingToEdit.title);
      setDescription(listingToEdit.description);
      setPrice(listingToEdit.price.toString());
      setOriginalPrice(listingToEdit.originalPrice ? listingToEdit.originalPrice.toString() : '');
      setCategory(listingToEdit.category);
      setCondition(listingToEdit.condition);
      setImageUrl(listingToEdit.imageUrl);
      setCampusLocation(listingToEdit.campusLocation);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setCategory('Textbooks & Notes');
      setCondition('Good');
      setImageUrl(PRESET_IMAGES[0].url);
      setCampusLocation('NMIT Campus / Library Quad');
    }
    setErrors({});
    setServerError('');
    setShowBookSearch(false);
  }, [listingToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time client-side input validation (Requirement 21)
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long.';
    }
    if (title.length > 120) {
      newErrors.title = 'Title cannot exceed 120 characters.';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Please provide a clear description (at least 10 characters).';
    }
    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid price in rupees greater than 0.';
    }
    if (originalPrice && (!isNaN(Number(originalPrice)) && Number(originalPrice) < numPrice)) {
      newErrors.originalPrice = 'Original price should be greater than selling price.';
    }
    if (!imageUrl.trim()) {
      newErrors.imageUrl = 'Please provide or select an image for your listing.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageUrl: 'Image must be under 8MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setErrors(prev => ({ ...prev, imageUrl: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSearchBooks = async () => {
    if (!bookQuery.trim()) return;
    setIsSearchingBooks(true);
    try {
      const results = await api.searchBooks(bookQuery.trim());
      setBookResults(results);
    } catch (e) {
      console.error('Book search error:', e);
    } finally {
      setIsSearchingBooks(false);
    }
  };

  const handleSelectBook = (book: any) => {
    setTitle(`${book.title} (by ${book.author})`);
    setDescription(`Prescribed engineering textbook: "${book.title}" by ${book.author}${book.firstPublishYear ? ` (First published ${book.firstPublishYear})` : ''}. Perfect condition for semester coursework.`);
    if (book.coverUrl) {
      setImageUrl(book.coverUrl);
    }
    setCategory('Textbooks & Notes');
    setShowBookSearch(false);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setServerError('');

    try {
      if (isEditing && listingToEdit) {
        await api.updateListing(listingToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category: category as any,
          condition,
          imageUrl,
          campusLocation
        });
      } else {
        await api.createListing({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category,
          condition,
          imageUrl,
          campusLocation
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to save listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-bold text-lg text-stone-900">
              {isEditing ? 'Edit Your Listing' : 'Post an Item for Sale'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Available to all verified students across NMIT Bangalore campus
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Quick External API Book Search Assistant (Requirement 17) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-semibold text-amber-950">
                  Selling a textbook or VTU guide?
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBookSearch(!showBookSearch)}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {showBookSearch ? 'Hide Search' : 'Auto-Fill from Open Library API'}
              </button>
            </div>

            {showBookSearch && (
              <div className="mt-3 pt-3 border-t border-amber-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bookQuery}
                    onChange={e => setBookQuery(e.target.value)}
                    placeholder="Search title or author (e.g., B.S. Grewal, Tanenbaum, Korth)..."
                    className="flex-1 text-xs border border-amber-300 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchBooks())}
                  />
                  <button
                    type="button"
                    onClick={handleSearchBooks}
                    disabled={isSearchingBooks}
                    className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {isSearchingBooks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Lookup</span>
                  </button>
                </div>

                {bookResults.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto mt-2">
                    {bookResults.map((b, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectBook(b)}
                        className="p-2 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-lg cursor-pointer flex items-center gap-2.5 transition-colors text-left"
                      >
                        <img src={b.coverUrl} alt={b.title} className="w-8 h-10 object-cover rounded shrink-0 bg-stone-100" />
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-stone-900 truncate">{b.title}</div>
                          <div className="text-[11px] text-stone-600 truncate">{b.author}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Item Name / Title (Requirement 2 & 21) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
              Item Title / Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="e.g., Casio fx-991EX Calculator or B.S. Grewal 44th Edition"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-500'
              } focus:outline-hidden focus:ring-1 focus:ring-amber-500`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Condition (Requirement 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                <option value="Like New">Like New (Almost brand new)</option>
                <option value="Good">Good (Gently used, fully functional)</option>
                <option value="Fair">Fair (Noticeable wear, still usable)</option>
              </select>
            </div>
          </div>

          {/* Pricing (Requirement 4 & 21) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                Selling Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={e => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: '' });
                  }}
                  placeholder="350"
                  min="1"
                  max="200000"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border font-mono text-sm ${
                    errors.price ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-500'
                  } focus:outline-hidden focus:ring-1 focus:ring-amber-500`}
                />
              </div>
              {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
                Original Retail MRP (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={e => {
                    setOriginalPrice(e.target.value);
                    if (errors.originalPrice) setErrors({ ...errors, originalPrice: '' });
                  }}
                  placeholder="899"
                  min="1"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-stone-300 font-mono text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
              {errors.originalPrice && <p className="text-xs text-rose-600 mt-1">{errors.originalPrice}</p>}
            </div>
          </div>

          {/* Description (Requirement 3 & 21) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
              Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="State working condition, branch or semester usefulness, how long you used it, etc."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-500'
              } focus:outline-hidden focus:ring-1 focus:ring-amber-500`}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Campus Meetup Spot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
              Campus Meetup / Pickup Spot
            </label>
            <input
              type="text"
              value={campusLocation}
              onChange={e => setCampusLocation(e.target.value)}
              placeholder="e.g., Kaveri Hostel / Central Library / Mechanical Quad"
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Image Upload & Presets (Requirement 6) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-mono">
              Item Image (Upload File or Select Preset) *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {/* File upload button */}
              <label className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-stone-50 hover:bg-amber-50/30 transition-colors">
                <Upload className="w-5 h-5 text-stone-600" />
                <span className="text-xs font-semibold text-stone-800">Upload Image File</span>
                <span className="text-[10px] text-stone-500">PNG, JPG, WebP up to 8MB</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Image Preview Box */}
              <div className="relative aspect-16/9 rounded-xl border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-stone-400 text-xs flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>No image preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Image URL input */}
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 font-mono mb-2 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-500 font-mono">Quick Presets:</span>
              {PRESET_IMAGES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(p.url)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    imageUrl === p.url
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-600'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {errors.imageUrl && <p className="text-xs text-rose-600 mt-1">{errors.imageUrl}</p>}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Update Listing' : 'Publish Listing to Campus'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
