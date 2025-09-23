"use client"

import { useState } from "react"
import { usePortfolioStore } from "@/src/store/portfolio"

export function CMSStatus() {
  const { dataSource, refreshData } = usePortfolioStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = () => {
    switch (dataSource) {
      case "sanity":
        return "bg-green-600/20 text-green-300 border-green-600/30"
      case "contentful":
        return "bg-blue-600/20 text-blue-300 border-blue-600/30"
      case "json":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
      case "demo":
        return "bg-gray-600/20 text-gray-300 border-gray-600/30"
      default:
        return "bg-gray-600/20 text-gray-300 border-gray-600/30"
    }
  }

  const getStatusText = () => {
    switch (dataSource) {
      case "sanity":
        return "Sanity CMS"
      case "contentful":
        return "Contentful CMS"
      case "json":
        return "JSON File"
      case "demo":
        return "Demo Data"
      default:
        return "Loading..."
    }
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <div className={`px-3 py-1 rounded-lg border text-xs font-medium ${getStatusColor()}`}>{getStatusText()}</div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-3 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-xs disabled:opacity-50"
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  )
}
