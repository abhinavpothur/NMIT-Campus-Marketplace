import React from 'react';
import {
  X,
  MapPin,
  Eye,
  CheckCircle,
  Phone,
  MessageSquare,
  Calendar,
  Tag,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Listing, User } from '../types/marketplace';

interface ListingDetailModalProps {
  listing: Listing | null;
  currentUser: User | null;
  onClose: () => void;
  onEdit: (listing: Listing) => void;
  onDelete: (listingId: string) => void;
  onToggleSold: (listingId: string, newStatus: 'active' | 'sold') => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onToggleSold
}) => {
  if (!listing) return null;

  const isOwner = currentUser?.id === listing.sellerId;
  const isSold = listing.status === 'sold';

  const discountPercent =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : null;

  const savingsAmount =
    listing.originalPrice && listing.originalPrice > listing.price
      ? listing.originalPrice - listing.price
      : 0;

  const cleanPhone = listing.sellerPhone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    `Hi ${listing.sellerName}, I saw your listing for "${listing.title}" (₹${listing.price}) on the NMIT Student Marketplace! Is it available?`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-stone-900/60 hover:bg-stone-900 text-white p-2 rounded-full backdrop-blur-md transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          {/* Header Media */}
          <div className="relative aspect-16/10 w-full bg-stone-100 overflow-hidden">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className={`w-full h-full object-cover ${isSold ? 'grayscale contrast-75' : ''}`}
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
              }}
            />

            {/* Sold Banner */}
            {isSold && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                <span className="bg-stone-900 text-white font-mono text-sm font-bold px-4 py-1.5 rounded-md tracking-widest border border-stone-600 shadow-xl">
                  ITEM MARKED AS SOLD
                </span>
                <p className="text-xs text-stone-300 mt-2 max-w-sm">
                  This item has already been purchased by another NMIT student.
                </p>
              </div>
            )}

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-stone-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                {listing.category}
              </span>
              <span className="bg-white/90 text-stone-900 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                Condition: {listing.condition}
              </span>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-6">
            {/* Price & Title */}
            <div>
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold font-mono text-stone-900">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <>
                    <span className="text-base text-stone-400 line-through font-mono">
                      ₹{listing.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold font-mono px-2 py-0.5 rounded">
                      {discountPercent}% OFF • Save ₹{savingsAmount.toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl font-bold text-stone-900 leading-snug">
                {listing.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Listed on {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  {listing.views} views
                </span>
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  NMIT Student Verified
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 font-mono">
                Item Description
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Campus Meetup / Delivery Location */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <MapPin className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-stone-900">Campus Meetup Location</div>
                <div className="text-sm text-stone-700">{listing.campusLocation}</div>
                <div className="text-[11px] text-stone-500 mt-0.5 font-mono">
                  Delivery Pin: 560064 (Yelahanka / NMIT Campus Quad)
                </div>
              </div>
            </div>

            {/* Seller Profile Card */}
            <div className="border border-stone-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${listing.sellerName}`}
                  alt={listing.sellerName}
                  className="w-12 h-12 rounded-full border border-stone-300"
                />
                <div>
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    {listing.sellerName}
                    <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                  </div>
                  <div className="text-xs text-stone-500">{listing.sellerBranch}</div>
                  <div className="text-[11px] text-stone-400 font-mono">USN: {listing.sellerUsn}</div>
                </div>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-2">
                  <a
                    href={isSold ? undefined : whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                      isSold ? 'pointer-events-none opacity-50 bg-stone-300' : ''
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${listing.sellerPhone}`}
                    className="flex items-center justify-center gap-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4 text-stone-500" />
                    <span>Call</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions for Owners */}
            {isOwner && (
              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onToggleSold(listing.id, isSold ? 'active' : 'sold')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs ${
                    isSold
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isSold ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Reactivate Listing (Mark as Available)</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Mark as Sold to Student</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(listing);
                    }}
                    className="flex items-center gap-1.5 border border-stone-300 hover:bg-stone-50 text-stone-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-stone-500" />
                    <span>Edit Listing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(listing.id)}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
