import React from 'react';

const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-700/60 rounded ${className}`} />
);

const CardSkeleton = () => (
  <div className="bg-slate-800 rounded-xl p-5 space-y-3">
    <div className="flex items-start justify-between">
      <Shimmer className="h-5 w-32" />
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-3/4" />
    <Shimmer className="h-2 w-full rounded-full mt-4" />
  </div>
);

const PageSkeleton = () => (
  <div className="min-h-[80vh] p-6 space-y-6 max-w-7xl mx-auto">
    {/* Header */}
    <div className="bg-slate-800 rounded-xl p-6 space-y-3">
      <div className="flex items-center gap-4">
        <Shimmer className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-7 w-64" />
          <Shimmer className="h-4 w-48" />
        </div>
        <Shimmer className="h-8 w-24" />
      </div>
    </div>
    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    {/* Wide card */}
    <div className="bg-slate-800 rounded-xl p-6 space-y-4">
      <Shimmer className="h-6 w-48" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
          <Shimmer className="h-4 w-4 rounded-full shrink-0" />
          <Shimmer className="h-4 flex-1" />
          <Shimmer className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-slate-800 rounded-xl overflow-hidden">
    <div className="p-4 border-b border-slate-700 flex gap-4">
      <Shimmer className="h-5 w-32" />
      <Shimmer className="h-5 w-24" />
      <Shimmer className="h-5 w-28" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-700/40 last:border-0">
        <Shimmer className="h-4 w-4 rounded-full shrink-0" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 flex-1" />
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

const VARIANTS = { card: CardSkeleton, page: PageSkeleton, table: TableSkeleton };

const LoadingSkeleton = ({ variant = 'card', ...props }) => {
  const Component = VARIANTS[variant] || CardSkeleton;
  return <Component {...props} />;
};

export default LoadingSkeleton;
