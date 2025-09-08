'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Search, Filter, MessageCircle, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  category: string
  customerName?: string
  customerEmail: string
  createdAt: string
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  messages: Array<{
    content: string
    createdAt: string
  }>
  _count: {
    messages: number
  }
}

export function AdminTicketsList() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    assignedToId: '',
    page: 1
  })

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20'
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.category) params.append('category', filters.category)
      if (filters.assignedToId) params.append('assignedToId', filters.assignedToId)

      const response = await fetch(`/api/admin/support/tickets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
        setStats(data.stats || {})
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch tickets',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [filters])

  const handleBulkUpdate = async (action: string, updateData: any) => {
    if (selectedTickets.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select tickets to update',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/admin/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ticketIds: selectedTickets,
          ...updateData
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Updated ${selectedTickets.length} tickets successfully`
        })
        setSelectedTickets([])
        fetchTickets()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update tickets',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { variant: 'default' as const, icon: Clock, label: 'Open' },
      IN_PROGRESS: { variant: 'secondary' as const, icon: AlertCircle, label: 'In Progress' },
      RESOLVED: { variant: 'outline' as const, icon: CheckCircle, label: 'Resolved' },
      CLOSED: { variant: 'secondary' as const, icon: XCircle, label: 'Closed' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { variant: 'outline' as const, className: 'border-green-200 text-green-700' },
      MEDIUM: { variant: 'outline' as const, className: 'border-blue-200 text-blue-700' },
      HIGH: { variant: 'outline' as const, className: 'border-orange-200 text-orange-700' },
      URGENT: { variant: 'destructive' as const, className: '' }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM

    return (
      <Badge variant={config.variant} className={config.className}>
        {priority}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {status.replace('_', ' ')}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                {getStatusBadge(status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="ORDER">Order</SelectItem>
                <SelectItem value="PRODUCT">Product</SelectItem>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="BILLING">Billing</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', status: '', priority: '', category: '', assignedToId: '', page: 1 })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkUpdate('bulk_update', { status: 'IN_PROGRESS' })}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkUpdate('bulk_update', { status: 'RESOLVED' })}
                >
                  Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkUpdate('bulk_update', { status: 'CLOSED' })}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">No support tickets match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTickets(prev => [...prev, ticket.id])
                      } else {
                        setSelectedTickets(prev => prev.filter(id => id !== ticket.id))
                      }
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <Link 
                          href={`/admin/support/tickets/${ticket.id}`}
                          className="hover:underline"
                        >
                          <h3 className="font-medium text-lg mb-2">{ticket.subject}</h3>
                        </Link>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                          <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>#{ticket.ticketNumber}</p>
                          <p className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{ticket.customerName || 'Customer'} ({ticket.customerEmail})</span>
                          </p>
                          {ticket.assignedTo && (
                            <p>Assigned to: {ticket.assignedTo.name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <p>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
                        <p className="flex items-center justify-end space-x-1 mt-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{ticket._count.messages} message{ticket._count.messages !== 1 ? 's' : ''}</span>
                        </p>
                      </div>
                    </div>

                    {ticket.messages.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {ticket.messages[0].content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
