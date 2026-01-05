'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function AdminDashboardClient() {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Revalidate page data
        window.location.reload()
    }

    return (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
    )
}
