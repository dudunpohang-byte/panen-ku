// Loading States — Skeleton loading for all pages

import React from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl bg-muted ${className}`}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </>
  );
}

export function ProductSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl bg-card p-3 shadow-sm">
          <Skeleton className="h-20 w-20 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card p-4 shadow-sm space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-card p-4 shadow-sm space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className={`space-y-2 ${i % 2 === 0 ? "" : "items-end"}`}>
            <Skeleton className={`h-8 w-48 rounded-xl ${i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"}`} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}