"use client"

import { Skeleton } from "../src/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4 bg-white/10" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-6 bg-white/5" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-20 bg-white/10" />
            <Skeleton className="h-10 w-24 bg-blue-600/20" />
            <Skeleton className="h-10 w-20 bg-gray-600/20" />
          </div>
        </div>

        {/* Navigation skeleton */}
        <div className="flex justify-center gap-4 mb-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 bg-white/5" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-16">
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-8">
              <Skeleton className="h-8 w-48 bg-white/10" />
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="space-y-3">
                    <Skeleton className="h-6 w-64 bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
