import { TicketDetail } from '@/components/support/ticket-detail'
import { Metadata } from 'next'

interface TicketPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: 'Support Ticket | Luxury Furniture Store',
  description: 'View and manage your support ticket details and messages.',
}

export default function TicketPage({ params }: TicketPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <TicketDetail ticketId={params.id} />
      </div>
    </div>
  )
}
