'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Search, Filter, X, Mail, Phone, Calendar, ChevronDown, ChevronUp, MessageSquare, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContact } from '@/hooks/useContact'
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ContactResponses() {
  const { toast } = useToast()
  const { responses, loading, error, getResponses, updateResponseStatus } = useContact()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState(null)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' })
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 8

  useEffect(() => {
    loadResponses()
  }, [currentPage, statusFilter, searchTerm, filterDate])

  const loadResponses = async () => {
    try {
      await getResponses({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter === 'all' ? '' : statusFilter,
        search: searchTerm,
        date: filterDate ? format(filterDate, 'yyyy-MM-dd') : ''
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact responses"
      })
    }
  }

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const toggleResponseStatus = async (id, newStatus) => {
    try {
      await updateResponseStatus(id, newStatus)
      toast({
        title: "Success",
        description: "Status updated successfully"
      })
      loadResponses()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status"
      })
    }
  }

  const sortedResponses = [...responses].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    }
    return sortConfig.direction === 'asc'
      ? a[sortConfig.key].localeCompare(b[sortConfig.key])
      : b[sortConfig.key].localeCompare(a[sortConfig.key])
  })

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Responses</h1>
          <p className="text-gray-600 mt-1">Manage and respond to contact form submissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Filter className="text-muted-foreground w-5 h-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Filter responses
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[120px] justify-between">
                      {statusFilter === 'all' ? 'All Messages' : 
                       statusFilter === 'unread' ? 'Unread' : 'Read'}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                      <DropdownMenuRadioItem value="all">All Messages</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="unread">Unread</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="read">Read</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2">
                <DatePicker
                  date={filterDate}
                  onSelect={setFilterDate}
                />
                {filterDate && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setFilterDate(null)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 text-sm font-medium">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Name {getSortIcon('name')}
                </button>
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Contact {getSortIcon('email')}
                </button>
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-primary transition-colors col-span-2"
                >
                  Message {getSortIcon('date')}
                </button>
                <div>Actions</div>
              </div>
              <div className="divide-y">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="space-y-4">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <p>Loading responses...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>{error}</p>
                  </div>
                ) : sortedResponses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="space-y-4">
                      <Search className="w-12 h-12 mx-auto text-primary-200" />
                      <p className="text-lg">No responses found for the selected filters</p>
                    </div>
                  </div>
                ) : (
                  sortedResponses.map((response) => (
                    <div
                      key={response.id}
                      className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{response.name}</span>
                        <Badge
                          variant={response.status === 'unread' ? 'default' : 'secondary'}
                          className="w-fit"
                        >
                          {response.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{response.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{response.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {response.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(response.created_at), 'PPP')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleResponseStatus(
                            response.id, 
                            response.status === 'read' ? 'unread' : 'read'
                          )}
                          className="transition-colors hover:text-primary"
                        >
                          Mark as {response.status === 'read' ? 'unread' : 'read'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between px-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!responses.length || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contact Response Details</DialogTitle>
            <DialogDescription>
              View the complete contact form submission details
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Name</h4>
                  <p className="text-sm">{selectedResponse.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <Badge
                    variant={selectedResponse.status === 'unread' ? 'default' : 'secondary'}
                  >
                    {selectedResponse.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Email</h4>
                  <p className="text-sm">{selectedResponse.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Phone</h4>
                  <p className="text-sm">{selectedResponse.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium mb-2">Date Submitted</h4>
                  <p className="text-sm">
                    {format(new Date(selectedResponse.created_at), 'PPP p')}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium mb-2">Message</h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedResponse.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

