'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SkeletonBlock, SkeletonLine } from '@/components/ui/Skeletons';

const TestamentEditor = dynamic(
  () => import('@/components/dashboard/testament/TestamentEditor').then((m) => m.TestamentEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col lg:flex-row gap-12 h-full min-h-[600px]">
        <div className="flex-1 flex flex-col gap-6 bg-[#1b1c1c] border border-[#c9a84c]/20 p-8 rounded-sm">
          <SkeletonLine width="150px" height="10px" />
          <SkeletonBlock height="48px" />
          <SkeletonBlock height="48px" />
          <SkeletonLine width="200px" height="10px" />
          <SkeletonBlock height="100px" />
        </div>
        <div className="flex-1">
          <SkeletonBlock height="600px" />
        </div>
      </div>
    ),
  },
);

export default function TestamentPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-[32px] font-normal text-[#c9a84c]">
          Testament Editor
        </h1>
        <p className="font-sans text-[12px] font-light text-[#d0c5b2] max-w-xl leading-relaxed tracking-[0.05em]">
          Define the succession protocol for your digital estate. This testament will be securely encrypted, stored, and only executed when the trigger conditions are met.
        </p>
      </div>

      <TestamentEditor />
    </div>
  );
}
