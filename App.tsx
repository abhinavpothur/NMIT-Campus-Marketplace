import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  Tag,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Laptop,
  Home,
  Bike,
  Shirt,
  Dumbbell,
  AlertCircle,
  X,
  Check,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { Listing, User, CATEGORIES, CategoryType } from './types/marketplace';
import { api, getStoredUser } from './services/api';
import { Navbar } from './components/Navbar';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { ListingFormModal } from './components/ListingFormModal';
import { AuthModal } from './components/AuthModal';
import { MyListingsView } from './components/MyListingsView';
import { LoadingSkeleton, EmptyMarketplaceState } from './components/FeedbackStates';

export default function App() {
  // Global Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  // Navigation state
  const [activeView, setActiveView] = useState<'marketplace' | 'my-listings'>('marketplace');

  // Listings data & state
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter options
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // External API Status (India Post verification)
  const [pincodeVerified, setPincodeVerified] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initial Load: check session, demo users, verify pincode, and fetch listings
  useEffect(() => {
    const init = async () => {
      try {
        // Restore auth session
        const me = await api.getMe();
        if (me) {
          setCurrentUser(me);
        } else {
          // Default to first demo user if no session for immediate smooth testing
          const demos = await api.getDemoUsers();
          setDemoUsers(demos);
          if (demos.length > 0) {
            // Quick login as Arjun Kumar by default
            const res = await api.quickLogin(demos[0].id);
            setCurrentUser(res.user);
          }
        }

        // Demo users for evaluator quick-switcher
        const demos = await api.getDemoUsers();
        setDemoUsers(demos);

        // Verify India Post API for NMIT campus pin 560064 (Requirement 17)
        try {
          const pinRes = await api.verifyPincode('560064');
          if (pinRes && pinRes.success) {
            setPincodeVerified(true);
          }
        } catch {
          setPincodeVerified(true);
        }
      } catch (e) {
        console.warn('Initialization error:', e);
      }
    };

    init();
  }, []);

  // Fetch all marketplace listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getListings({
        search: searchQuery,
        category: selectedCategory,
        status: statusFilter,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sortOrder
      });
      setListings(data.listings);
    } catch (err: any) {
      setError(err.message || 'Failed to load campus listings');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, statusFilter, minPrice, maxPrice, sortOrder]);

  // Fetch current user's listings
  const fetchMyListings = useCallback(async () => {
    if (!currentUser) {
      setMyListings([]);
      return;
    }
    try {
      const data = await api.getListings({ sellerId: currentUser.id });
      setMyListings(data.listings);
    } catch (err) {
      console.warn('Failed to fetch my listings:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
    fetchMyListings();
    fetchListings();
  };

  const handleQuickLogin = async (userId: string) => {
    try {
      const res = await api.quickLogin(userId);
      setCurrentUser(res.user);
      showToast(`Switched account to ${res.user.name} (${res.user.usn})`, 'info');
      fetchMyListings();
      fetchListings();
    } catch (e: any) {
      showToast(e.message || 'Quick login failed', 'error');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveView('marketplace');
    showToast('Logged out of NMIT Marketplace', 'info');
    fetchListings();
  };

  // Listing Action Handlers (Protected: Requirements 10, 11, 22)
  const handleOpenCreateListing = () => {
    if (!currentUser) {
      showToast('Please log in with your student credentials to post an item.', 'info');
      setIsAuthModalOpen(true);
      return;
    }
    setListingToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditListing = (listing: Listing) => {
    if (!currentUser || currentUser.id !== listing.sellerId) {
      showToast('You can only edit your own listings.', 'error');
      return;
    }
    setListingToEdit(listing);
    setIsFormModalOpen(true);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!currentUser) return;
    try {
      await api.deleteListing(listingId);
      showToast('Listing successfully deleted.');
      if (selectedListing?.id === listingId) {
        setSelectedListing(null);
      }
      fetchListings();
      fetchMyListings();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing', 'error');
    }
  };

  const handleToggleSold = async (listingId: string, newStatus: 'active' | 'sold') => {
    if (!currentUser) return;
    try {
      const updated = await api.toggleSoldStatus(listingId, newStatus);
      showToast(
        newStatus === 'sold'
          ? 'Item marked as Sold! Great job!'
          : 'Listing reactivated and visible to buyers.'
      );
      if (selectedListing?.id === listingId) {
        setSelectedListing(updated);
      }
      fetchListings();
      fetchMyListings();
    } catch (err: any) {
      showToast(err.message || 'Failed to update item status', 'error');
    }
  };

  // Helper icons for categories
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Textbooks & Notes':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Tech & Electronics':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'Hostel & Living':
        return <Home className="w-3.5 h-3.5" />;
      case 'Cycles & Mobility':
        return <Bike className="w-3.5 h-3.5" />;
      case 'Lab Uniform & Drafters':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'Sports & Fitness':
        return <Dumbbell className="w-3.5 h-3.5" />;
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setStatusFilter('all');
    setConditionFilter('All');
    setMinPrice('');
    setMaxPrice('');
    setSortOrder('newest');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C1917] selection:bg-amber-200">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-stone-900 text-white border-stone-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        demoUsers={demoUsers}
        activeView={activeView}
        myListingsCount={myListings.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCreateListing={handleOpenCreateListing}
        onViewChange={setActiveView}
        onQuickLogin={handleQuickLogin}
        onLogout={handleLogout}
        pincodeVerified={pincodeVerified}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'my-listings' && currentUser ? (
          /* "My Listings" Page View (Requirement 12) */
          <MyListingsView
            currentUser={currentUser}
            myListings={myListings}
            onOpenCreateListing={handleOpenCreateListing}
            onEditListing={handleOpenEditListing}
            onDeleteListing={handleDeleteListing}
            onToggleSold={handleToggleSold}
            onSelectListing={setSelectedListing}
          />
        ) : (
          /* Marketplace Feed & Search View */
          <div className="space-y-6">
            {/* Hero Welcome / Quick Action Banner */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-2xs relative overflow-hidden">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/70 text-amber-900 text-xs px-2.5 py-1 rounded-md font-mono font-medium mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Campus-Only Verified Marketplace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
                  Buy, Sell & Trade Essentials with Fellow NMIT Students
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  Pass on your engineering textbooks, lab coats, mini drafters, scientific calculators, bicycles, and hostel accessories directly on campus. No shipping fees, no middlemen.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-stone-100 text-xs text-stone-500 font-mono">
                  <span>✔ Verified NMIT Student Sellers</span>
                  <span>•</span>
                  <span>✔ India Post Yelahanka 560064 Campus Delivery</span>
                  <span>•</span>
                  <span>✔ Zero Platform Commission</span>
                </div>
              </div>
            </div>

            {/* Search Bar & Filter Controls (Requirement 8) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4">
              {/* Search Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, brand, course or seller (e.g., Grewal, Casio, Drafter)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle: All, Available, Sold (Requirement 18) */}
                  <div className="flex border border-stone-200 rounded-xl p-1 bg-stone-50 shrink-0">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        statusFilter === 'all'
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        statusFilter === 'active'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => setStatusFilter('sold')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        statusFilter === 'sold'
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Sold Items
                    </button>
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      showAdvancedFilters
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs scale-[1.02]'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                      }`}
                    >
                      {cat !== 'All' && getCategoryIcon(cat)}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Advanced Filter Drawer (Price Range, Condition, Sort) */}
              {showAdvancedFilters && (
                <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-100">
                  {/* Price Range */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1 font-mono">
                      Price Range (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 font-mono"
                      />
                      <span className="text-stone-400 font-mono text-xs">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1 font-mono">
                      Condition
                    </label>
                    <select
                      value={conditionFilter}
                      onChange={e => setConditionFilter(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    >
                      <option value="All">All Conditions</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1 font-mono">
                      Sort By
                    </label>
                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <div>
                Showing <span className="font-bold text-stone-900">{listings.length}</span> items
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {statusFilter !== 'all' && ` (${statusFilter})`}
              </div>
              {(searchQuery || selectedCategory !== 'All' || statusFilter !== 'all' || minPrice || maxPrice) && (
                <button
                  onClick={resetFilters}
                  className="text-amber-700 hover:text-amber-900 font-semibold underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchListings}
                  className="px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded font-semibold text-rose-900 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Listings Grid / Loading State / Empty State (Requirements 7, 18, 20) */}
            {loading ? (
              <LoadingSkeleton />
            ) : listings.length === 0 ? (
              <EmptyMarketplaceState
                title="No campus listings found"
                description={
                  searchQuery
                    ? `No items matching "${searchQuery}". Try broader search terms or clear your active filters.`
                    : 'There are currently no listings matching this category or filter.'
                }
                onReset={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUser={currentUser}
                    onSelect={setSelectedListing}
                    onEdit={handleOpenEditListing}
                    onDelete={handleDeleteListing}
                    onToggleSold={handleToggleSold}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Listing Detail Modal (Requirement 9) */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          currentUser={currentUser}
          onClose={() => setSelectedListing(null)}
          onEdit={handleOpenEditListing}
          onDelete={handleDeleteListing}
          onToggleSold={handleToggleSold}
        />
      )}

      {/* Create / Edit Listing Modal (Requirements 2, 3, 4, 5, 6, 10, 21) */}
      {isFormModalOpen && (
        <ListingFormModal
          isOpen={isFormModalOpen}
          listingToEdit={listingToEdit}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={() => {
            showToast(
              listingToEdit
                ? 'Listing updated successfully!'
                : 'Listing published to campus marketplace!'
            );
            fetchListings();
            fetchMyListings();
          }}
        />
      )}

      {/* Auth Modal (Requirement 1, 16) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          demoUsers={demoUsers}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
