import { TicketList } from '@/components/support/ticket-list'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Center | Luxury Furniture Store',
  description: 'Get help with your orders, products, and account. View and manage your support tickets.',
}

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TicketList />
    </div>
  )
}
