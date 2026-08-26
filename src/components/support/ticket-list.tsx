'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { MessageCircle, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
  assignedTo?: {
    name: string
    email: string
  }
  messages: Array<{
    content: string
    createdAt: string
  }>
}

export function TicketList() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/support/tickets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
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
    if (session?.user) {
      fetchTickets()
    }
  }, [session, statusFilter])

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

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in Required</h3>
          <p className="text-gray-500">Please sign in to view your support tickets.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Link href="/support/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <Select
              value={statusFilter || undefined}
              onValueChange={(value) => setStatusFilter(value || '')}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500 mb-4">
                {statusFilter 
                  ? `No tickets with status "${statusFilter}"`
                  : "You haven't created any support tickets yet."
                }
              </p>
              <Link href="/support/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-lg">{ticket.subject}</h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Ticket #{ticket.ticketNumber}</p>
                        <p>Category: {ticket.category.replace('_', ' ')}</p>
                        {ticket.assignedTo && (
                          <p>Assigned to: {ticket.assignedTo.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <p>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
                      {ticket.messages.length > 0 && (
                        <p className="flex items-center justify-end space-x-1 mt-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {ticket.messages.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {ticket.messages[0].content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
