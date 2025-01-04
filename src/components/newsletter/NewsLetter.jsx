'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, startOfToday, endOfToday } from 'date-fns'
import { Mail, Calendar, ChevronDown, ChevronUp, ArrowUpDown, FileSpreadsheet, FileText, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNewsletter } from '@/hooks/useNewsletter'
import { toast } from 'react-toastify'

const ITEMS_PER_PAGE = 8;

export default function Newsletter() {
  const { subscribers, loading, error, getSubscribers } = useNewsletter()
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [downloadType, setDownloadType] = useState('today')
  const [selectedDate, setSelectedDate] = useState(null)
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadPreviewPage, setDownloadPreviewPage] = useState(1)

  useEffect(() => {
    getSubscribers().catch(err => {
      toast.error(err.message || 'Failed to load subscribers')
    })
  }, [getSubscribers])

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
    })
  }

  const handleDownload = async (format) => {
    try {
      let dateFilter = {}
      
      switch(downloadType) {
        case 'today':
          dateFilter = {
            start: startOfToday(),
            end: endOfToday()
          }
          break
        case 'custom':
          if (!selectedDate) {
            toast.error('Please select a date')
            return
          }
          dateFilter = {
            date: selectedDate
          }
          break
        case 'range':
          if (!dateRange.start || !dateRange.end) {
            toast.error('Please select both start and end dates')
            return
          }
          dateFilter = dateRange
          break
      }

      // TODO: Implement actual download functionality
      toast.success(`Downloading ${format.toUpperCase()} file...`)
    } catch (err) {
      toast.error(err.message || 'Failed to download file')
    }
  }

  const sortedSubscribers = useMemo(() => {
    if (!Array.isArray(subscribers)) return [];
    return [...subscribers].sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at)
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key])
    })
  }, [subscribers, sortConfig])

  const filteredSubscribers = useMemo(() => {
    if (!sortedSubscribers.length) return [];
    let filtered = [...sortedSubscribers];
    
    switch(downloadType) {
      case 'today':
        filtered = filtered.filter(sub => {
          const subDate = new Date(sub.created_at)
          return subDate >= startOfToday() && subDate <= endOfToday()
        })
        break
      case 'custom':
        if (selectedDate) {
          filtered = filtered.filter(sub => 
            sub.created_at && format(new Date(sub.created_at), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          )
        }
        break
      case 'range':
        if (dateRange.start && dateRange.end) {
          filtered = filtered.filter(sub => {
            const subDate = new Date(sub.created_at)
            return subDate >= dateRange.start && subDate <= dateRange.end
          })
        }
        break
    }
    
    return filtered
  }, [sortedSubscribers, downloadType, selectedDate, dateRange])

  const paginatedSubscribers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedSubscribers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedSubscribers, currentPage])

  const paginatedFilteredSubscribers = useMemo(() => {
    const startIndex = (downloadPreviewPage - 1) * ITEMS_PER_PAGE
    return filteredSubscribers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredSubscribers, downloadPreviewPage])

  const totalPages = Math.ceil(sortedSubscribers.length / ITEMS_PER_PAGE)
  const totalFilteredPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE)

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />
  }

  const SubscribersList = ({ subscribers, showHeader = true }) => (
    <div className="rounded-md border">
      {showHeader && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 text-sm font-medium">
          <button
            onClick={() => handleSort('email')}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            Email {getSortIcon('email')}
          </button>
          <button
            onClick={() => handleSort('created_at')}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            Subscription Date {getSortIcon('created_at')}
          </button>
          <button
            onClick={() => handleSort('status')}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            Status {getSortIcon('status')}
          </button>
        </div>
      )}
      <div className="divide-y">
        {subscribers.map((subscriber) => (
          <div
            key={subscriber.id}
            className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{subscriber.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {subscriber.created_at ? format(new Date(subscriber.created_at), 'PPP') : 'No date'}
              </span>
            </div>
            <div>
              <Badge
                variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                className="w-fit"
              >
                {subscriber.status}
              </Badge>
            </div>
          </div>
        ))}
        {subscribers.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="space-y-4">
              <Mail className="w-12 h-12 mx-auto text-primary-200" />
              <p className="text-lg">No subscribers found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex items-center justify-between px-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading subscribers</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => getSubscribers()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage your newsletter subscribers</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-white p-1 text-muted-foreground gap-1 border border-input">
          <TabsTrigger 
            value="list" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-primary-500/90 hover:text-white"
          >
            Subscribers List
          </TabsTrigger>
          <TabsTrigger 
            value="download" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-primary-500/90 hover:text-white"
          >
            Download Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <SubscribersList subscribers={paginatedSubscribers} />
                  {paginatedSubscribers.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download">
          <div className="grid grid-cols-[300px_1fr] gap-6">
            {/* Left Column - Calendar and Options */}
            <Card>
              <CardHeader>
                <CardTitle>Download Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={downloadType} onValueChange={setDownloadType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="today" id="today" />
                    <Label htmlFor="today">Download Today's List</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom Date</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="range" />
                    <Label htmlFor="range">Date Range</Label>
                  </div>
                </RadioGroup>

                <div className="space-y-4">
                  {downloadType === 'custom' && (
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <DatePicker
                        date={selectedDate}
                        onSelect={setSelectedDate}
                      />
                    </div>
                  )}

                  {downloadType === 'range' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <DatePicker
                          date={dateRange.start}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <DatePicker
                          date={dateRange.end}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => handleDownload('xlsx')}
                      className="w-full"
                      disabled={loading || (
                        (downloadType === 'custom' && !selectedDate) ||
                        (downloadType === 'range' && (!dateRange.start || !dateRange.end))
                      )}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Download XLSX
                    </Button>
                    <Button
                      onClick={() => handleDownload('pdf')}
                      className="w-full"
                      disabled={loading || (
                        (downloadType === 'custom' && !selectedDate) ||
                        (downloadType === 'range' && (!dateRange.start || !dateRange.end))
                      )}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Download Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {downloadType === 'today' && "Today's subscribers"}
                  {downloadType === 'custom' && (selectedDate ? `Subscribers from ${format(selectedDate, 'PP')}` : 'Select a date')}
                  {downloadType === 'range' && (
                    dateRange.start && dateRange.end 
                      ? `Subscribers from ${format(dateRange.start, 'PP')} to ${format(dateRange.end, 'PP')}`
                      : 'Select date range'
                  )}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <SubscribersList 
                      subscribers={paginatedFilteredSubscribers} 
                      showHeader={false}
                    />
                    {paginatedFilteredSubscribers.length > 0 && (
                      <Pagination
                        currentPage={downloadPreviewPage}
                        totalPages={totalFilteredPages}
                        onPageChange={setDownloadPreviewPage}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

