import { TicketForm } from '@/components/support/ticket-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Support Ticket | Luxury Furniture Store',
  description: 'Create a new support ticket to get help with your orders, products, or account.',
}

export default function NewTicketPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Contact Support</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Need help? Create a support ticket and our team will get back to you as soon as possible. 
            Please provide as much detail as possible to help us assist you better.
          </p>
        </div>
        
        <TicketForm />
      </div>
    </div>
  )
}
