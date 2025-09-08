'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { MessageCircle, Send, Clock, CheckCircle, XCircle, AlertCircle, User, Headphones } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SupportMessage {
  id: string
  content: string
  isFromCustomer: boolean
  senderName: string
  createdAt: string
}

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  customerName?: string
  customerEmail: string
  createdAt: string
  assignedTo?: {
    name: string
    email: string
  }
  messages: SupportMessage[]
}

interface TicketDetailProps {
  ticketId: string
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else if (response.status === 404) {
        toast({
          title: 'Ticket Not Found',
          description: 'The requested ticket could not be found.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch ticket details',
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
      fetchTicket()
    }
  }, [session, ticketId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a message',
        variant: 'destructive'
      })
      return
    }

    setIsSending(true)

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchTicket() // Refresh ticket data
        toast({
          title: 'Message Sent',
          description: 'Your message has been sent successfully.'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to send message',
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
      setIsSending(false)
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

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in Required</h3>
          <p className="text-gray-500">Please sign in to view this support ticket.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading ticket details...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket Not Found</h3>
          <p className="text-gray-500">The requested support ticket could not be found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl mb-2">{ticket.subject}</CardTitle>
              <div className="flex items-center space-x-2 mb-2">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
                <Badge variant="outline">{ticket.category.replace('_', ' ')}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Ticket #{ticket.ticketNumber} • Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </p>
            </div>
            {ticket.assignedTo && (
              <div className="text-right">
                <p className="text-sm font-medium">Assigned to</p>
                <p className="text-sm text-gray-600">{ticket.assignedTo.name}</p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <Card key={message.id} className={message.isFromCustomer ? 'ml-8' : 'mr-8'}>
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${message.isFromCustomer ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {message.isFromCustomer ? (
                    <User className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Headphones className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{message.senderName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {ticket.status !== 'CLOSED' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                maxLength={5000}
                required
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {newMessage.length}/5000 characters
                </p>
                <Button type="submit" disabled={isSending}>
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {ticket.status === 'CLOSED' && (
        <Card>
          <CardContent className="text-center py-6">
            <XCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">This ticket has been closed and no longer accepts replies.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
