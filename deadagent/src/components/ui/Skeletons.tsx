'use client';

import React from 'react';

// ── Skeleton Primitives ────────────────────────────────────
export function SkeletonLine({ width = '100%', height = '12px' }: { width?: string; height?: string }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export function SkeletonBlock({ width = '100%', height = '80px' }: { width?: string; height?: string }) {
  return <div className="skeleton" style={{ width, height }} />;
}

// ── Metric Card Skeleton ───────────────────────────────────
export function MetricCardSkeleton() {
  return (
    <div className="bg-[#1b1c1c] border border-[#c9a84c]/10 rounded-sm p-6 flex flex-col gap-4">
      <SkeletonLine width="60%" height="10px" />
      <SkeletonLine width="40%" height="24px" />
      <SkeletonLine width="80%" height="10px" />
    </div>
  );
}

// ── Event Card Skeleton ────────────────────────────────────
export function EventCardSkeleton() {
  return (
    <div className="bg-[#1b1c1c] border border-[#c9a84c]/10 rounded-sm p-5 flex items-center gap-6">
      <SkeletonLine width="80px" height="10px" />
      <SkeletonLine width="100px" height="24px" />
      <SkeletonLine width="80px" height="24px" />
      <div className="flex-1">
        <SkeletonLine width="60%" height="10px" />
      </div>
    </div>
  );
}

// ── Settings Section Skeleton ──────────────────────────────
export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-12 max-w-2xl">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-4">
          <SkeletonLine width="150px" height="10px" />
          <SkeletonBlock height="48px" />
          <SkeletonBlock height="48px" />
        </div>
      ))}
    </div>
  );
}

// ── Dashboard Grid Skeleton ────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <SkeletonLine width="200px" height="28px" />
        <SkeletonLine width="350px" height="12px" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      <SkeletonBlock height="300px" />
    </div>
  );
}

// ── Feed Skeleton ──────────────────────────────────────────
export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
