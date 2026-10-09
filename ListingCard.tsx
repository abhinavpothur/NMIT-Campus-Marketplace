import React from 'react';
import {
  Tag,
  MapPin,
  Eye,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Check,
  RotateCcw
} from 'lucide-react';
import { Listing, User } from '../types/marketplace';

interface ListingCardProps {
  listing: Listing;
  currentUser: User | null;
  onSelect: (listing: Listing) => void;
  onEdit?: (listing: Listing) => void;
  onDelete?: (listingId: string) => void;
  onToggleSold?: (listingId: string, newStatus: 'active' | 'sold') => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleSold
}) => {
  const isOwner = currentUser?.id === listing.sellerId;
  const isSold = listing.status === 'sold';

  const discountPercent =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : null;

  return (
    <div
      onClick={() => onSelect(listing)}
      className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSold
          ? 'border-stone-200 bg-stone-50/70 opacity-90'
          : 'border-stone-200 hover:border-amber-400 hover:shadow-md'
      }`}
    >
      {/* Image Area */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isSold ? 'grayscale contrast-75' : ''
          }`}
          onError={e => {
            // Fallback image if broken
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* SOLD Overlay Badge (Requirement 18: Clearly distinguish sold items) */}
        {isSold && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center">
            <span className="bg-stone-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-md tracking-widest border border-stone-600 shadow-lg">
              SOLD
            </span>
            <span className="text-[11px] text-stone-200 mt-1 font-medium">
              Item acquired by student
            </span>
          </div>
        )}

        {/* Category & Condition Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
            {listing.category}
          </span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded shadow-xs backdrop-blur-md ${
              listing.condition === 'Like New'
                ? 'bg-emerald-900/85 text-emerald-100'
                : listing.condition === 'Good'
                ? 'bg-blue-900/85 text-blue-100'
                : 'bg-stone-800/80 text-stone-200'
            }`}
          >
            {listing.condition}
          </span>
        </div>

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && !isSold && (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded font-mono shadow-xs">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-xl font-bold font-mono text-stone-900">
              ₹{listing.price.toLocaleString('en-IN')}
            </span>
            {listing.originalPrice && listing.originalPrice > listing.price && (
              <span className="text-xs text-stone-400 line-through font-mono">
                ₹{listing.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            {listing.title}
          </h3>

          {/* Description Excerpt */}
          <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
          {/* Seller & Campus Spot */}
          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <div className="flex items-center gap-1 truncate font-medium text-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="truncate">{listing.sellerName}</span>
              <span className="text-stone-400 font-mono text-[10px]">({listing.sellerUsn})</span>
            </div>
            <div className="flex items-center gap-1 text-stone-400 font-mono shrink-0">
              <Eye className="w-3 h-3" />
              <span>{listing.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <div className="flex items-center gap-1 truncate text-stone-600">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{listing.campusLocation}</span>
            </div>
            <div className="text-stone-400 text-[10px]">
              {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Owner Controls (Requirement 10, 11, 22) */}
          {isOwner && (
            <div
              className="pt-2 mt-1 border-t border-dashed border-stone-200 flex items-center justify-between gap-1.5"
              onClick={e => e.stopPropagation()}
            >
              {onToggleSold && (
                <button
                  type="button"
                  onClick={() => onToggleSold(listing.id, isSold ? 'active' : 'sold')}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                    isSold
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title={isSold ? 'Reactivate listing' : 'Mark as sold'}
                >
                  {isSold ? (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      <span>Reactivate</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Mark Sold</span>
                    </>
                  )}
                </button>
              )}

              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(listing)}
                    className="p-1 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    title="Edit listing"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(listing.id)}
                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
