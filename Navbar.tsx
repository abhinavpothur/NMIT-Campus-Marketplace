import React from 'react';
import {
  GraduationCap,
  PlusCircle,
  Package,
  LogOut,
  LogIn,
  UserCheck,
  MapPin,
  Sparkles
} from 'lucide-react';
import { User } from '../types/marketplace';

interface NavbarProps {
  currentUser: User | null;
  demoUsers: User[];
  activeView: 'marketplace' | 'my-listings';
  myListingsCount: number;
  onOpenAuth: () => void;
  onOpenCreateListing: () => void;
  onViewChange: (view: 'marketplace' | 'my-listings') => void;
  onQuickLogin: (userId: string) => void;
  onLogout: () => void;
  pincodeVerified: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  demoUsers,
  activeView,
  myListingsCount,
  onOpenAuth,
  onOpenCreateListing,
  onViewChange,
  onQuickLogin,
  onLogout,
  pincodeVerified
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Campus Alert Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 font-mono flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">NMIT Student Marketplace</span>
            <span className="hidden sm:inline text-stone-400">• Official Peer-to-Peer Campus Exchange</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2 py-0.5 rounded text-amber-300 border border-stone-700">
              <MapPin className="w-3 h-3" />
              <span>PIN 560064 (Yelahanka, NMIT Campus)</span>
              {pincodeVerified && (
                <span className="bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded text-[10px]">
                  Verified
                </span>
              )}
            </div>

            {/* Quick Demo Account Switcher for Evaluators */}
            <div className="hidden md:flex items-center gap-1.5 border-l border-stone-700 pl-3">
              <span className="text-stone-400">Quick Test:</span>
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => onQuickLogin(u.id)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    currentUser?.id === u.id
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                  title={`Sign in as ${u.name} (${u.usn})`}
                >
                  {u.name.split(' ')[0]} ({u.branch.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange('marketplace')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-amber-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors block leading-tight">
                NMIT Marketplace
              </span>
              <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Verified Student Trade
              </span>
            </div>
          </button>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onViewChange('marketplace')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'marketplace'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Browse Listings
          </button>

          {currentUser && (
            <button
              onClick={() => onViewChange('my-listings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'my-listings'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Listings</span>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                {myListingsCount}
              </span>
            </button>
          )}

          {/* Sell Item Button */}
          <button
            onClick={onOpenCreateListing}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Post Listing</span>
            <span className="sm:hidden">Post</span>
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                />
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-stone-900 leading-tight flex items-center gap-1">
                    {currentUser.name}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">{currentUser.usn}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-2xs"
            >
              <LogIn className="w-4 h-4 text-stone-600" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
