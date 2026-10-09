import React from 'react';
import { SearchX, PackageX, RotateCcw } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
          <div className="aspect-4/3 bg-stone-200 w-full" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-6 bg-stone-200 rounded w-1/3" />
              <div className="h-4 bg-stone-200 rounded w-1/4" />
            </div>
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-full" />
            <div className="pt-3 border-t border-stone-100 flex justify-between">
              <div className="h-3 bg-stone-100 rounded w-1/3" />
              <div className="h-3 bg-stone-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  actionText?: string;
}

export const EmptyMarketplaceState: React.FC<EmptyStateProps> = ({
  title = 'No student listings found',
  description = 'Try searching with different keywords or clearing your category filters.',
  onReset,
  actionText = 'Reset Search & Filters'
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-2xs">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4 border border-stone-200">
        <SearchX className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-stone-900">{title}</h3>
      <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
        {description}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-1.5 border border-stone-300 hover:bg-stone-50 text-stone-800 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
