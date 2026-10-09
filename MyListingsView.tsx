import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  Tag,
  CheckCircle,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Listing, User } from '../types/marketplace';

interface MyListingsViewProps {
  currentUser: User;
  myListings: Listing[];
  onOpenCreateListing: () => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (listingId: string) => void;
  onToggleSold: (listingId: string, newStatus: 'active' | 'sold') => void;
  onSelectListing: (listing: Listing) => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  currentUser,
  myListings,
  onOpenCreateListing,
  onEditListing,
  onDeleteListing,
  onToggleSold,
  onSelectListing
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const activeCount = myListings.filter(l => l.status === 'active').length;
  const soldCount = myListings.filter(l => l.status === 'sold').length;
  const totalEarnings = myListings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + l.price, 0);

  const filteredListings = myListings.filter(l => {
    if (filter === 'active') return l.status === 'active';
    if (filter === 'sold') return l.status === 'sold';
    return true;
  });

  const confirmDelete = (id: string) => {
    onDeleteListing(id);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Profile & Summary Stats Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full border-2 border-stone-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">{currentUser.name}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Seller
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentUser.branch} • USN: <span className="font-mono">{currentUser.usn}</span>
              </p>
              <p className="text-xs text-stone-400 mt-0.5 font-mono">
                Hostel: {currentUser.hostelBlock || 'NMIT Campus'} • {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCreateListing}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-all active:scale-[0.98] self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100">
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <span className="text-[11px] font-mono text-stone-500 block uppercase">Total Listed</span>
            <span className="text-2xl font-bold font-mono text-stone-900 mt-1 block">
              {myListings.length}
            </span>
          </div>
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <span className="text-[11px] font-mono text-stone-500 block uppercase">Active Items</span>
            <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <span className="text-[11px] font-mono text-stone-500 block uppercase">Sold to Students</span>
            <span className="text-2xl font-bold font-mono text-stone-700 mt-1 block">
              {soldCount}
            </span>
          </div>
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80">
            <span className="text-[11px] font-mono text-stone-500 block uppercase">Realized Revenue</span>
            <span className="text-2xl font-bold font-mono text-amber-800 mt-1 block">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Content Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-stone-200 bg-white p-1 rounded-xl shadow-2xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            All Items ({myListings.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'active'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'sold'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Sold ({soldCount})
          </button>
        </div>

        <span className="text-xs text-stone-500 font-mono">
          Showing {filteredListings.length} of {myListings.length} listings
        </span>
      </div>

      {/* Listings List / Empty State */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No listings found in this filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
            {filter === 'sold'
              ? 'None of your items have been marked as sold yet.'
              : filter === 'active'
              ? 'You do not have any active listings currently.'
              : 'You have not created any campus marketplace listings yet. Sell your unused textbooks, gadgets, calculators, or lab coats to fellow NMIT students!'}
          </p>
          <button
            onClick={onOpenCreateListing}
            className="mt-5 inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Listing</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map(listing => {
            const isSold = listing.status === 'sold';

            return (
              <div
                key={listing.id}
                className={`bg-white rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSold
                    ? 'border-stone-200 bg-stone-50/60'
                    : 'border-stone-200 hover:border-stone-300 shadow-2xs'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => onSelectListing(listing)}
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    {isSold && (
                      <span className="absolute inset-0 bg-stone-950/60 flex items-center justify-center text-[10px] font-mono font-bold text-white tracking-wider">
                        SOLD
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-stone-100 text-stone-700 text-[10px] font-medium px-2 py-0.5 rounded">
                        {listing.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isSold
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isSold ? '● SOLD' : '● ACTIVE'}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm truncate hover:text-amber-700 transition-colors">
                      {listing.title}
                    </h4>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 font-mono">
                      <span className="font-bold text-stone-900 text-sm">
                        ₹{listing.price.toLocaleString('en-IN')}
                      </span>
                      {listing.originalPrice && (
                        <span className="line-through text-stone-400">
                          ₹{listing.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span>• {listing.condition}</span>
                      <span className="hidden sm:inline flex items-center gap-1">
                        <Eye className="w-3 h-3 text-stone-400" /> {listing.views} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Owner Action Buttons (Requirements 10, 11, 22) */}
                <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100 justify-end shrink-0">
                  {/* Toggle Sold Status Button (Requirement 11) */}
                  <button
                    type="button"
                    onClick={() => onToggleSold(listing.id, isSold ? 'active' : 'sold')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isSold
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                    }`}
                    title={isSold ? 'Reactivate item' : 'Mark as sold'}
                  >
                    {isSold ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Sold</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button (Requirement 10) */}
                  <button
                    type="button"
                    onClick={() => onEditListing(listing)}
                    className="flex items-center gap-1 border border-stone-300 hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    title="Edit listing"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button (Requirement 10) */}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(listing.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Delete this listing?</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              This will permanently remove the item from the NMIT Student Marketplace and database. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(itemToDelete)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
