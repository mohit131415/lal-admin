'use client'

import { useState, useEffect } from 'react'
import { FileText, Inbox, FolderOpen, Mail } from 'lucide-react'
import { StatsCard } from './StatsCard'
import { RecentLogs } from './RecentLogs'
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dashboardService } from '@/api/services/dashboardService'
import { toast } from 'react-toastify'

const ITEMS_PER_PAGE = 7

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState({ data: [], pagination: { total_pages: 1 } })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [statsResponse, logsResponse] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getLogs(currentPage, ITEMS_PER_PAGE)
        ])

        if (statsResponse?.status === 'success' && statsResponse?.data) {
          setStats(statsResponse.data)
        } else {
          throw new Error('Failed to fetch statistics')
        }

        if (logsResponse?.status === 'success' && logsResponse?.data) {
          setLogs({
            data: logsResponse.data,
            pagination: { total_pages: Math.ceil(logsResponse.data.length / ITEMS_PER_PAGE) }
          })
        } else {
          throw new Error('Failed to fetch activity logs')
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err)
        setError(err.message || 'An error occurred while fetching dashboard data')
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentPage])

  const statsItems = stats ? [
    {
      title: 'Blog Posts',
      count: stats.blogPosts.toString(),
      icon: FileText
    },
    {
      title: 'Contact Responses',
      count: stats.contactResponses.toString(),
      icon: Inbox
    },
    {
      title: 'Resources',
      count: stats.resources.toString(),
      icon: FolderOpen
    },
    {
      title: 'Newsletter Subscribers',
      count: stats.subscribers.toString(),
      icon: Mail
    }
  ] : []

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-xl" />
          ))
        ) : (
          statsItems.map((stat, index) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
              index={index}
              //trend={stat.trend} //removed trend prop
            />
          ))
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] rounded-xl" />
      ) : (
        <RecentLogs
          logs={logs.data}
          currentPage={currentPage}
          totalPages={logs.pagination.total_pages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

