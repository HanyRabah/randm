import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Scale, Shield, Crown } from 'lucide-react'
import Image from 'next/image'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return await generateSeoMetadata({
    title: 'Terms of Service - Legal Information',
    description: 'R&M Store terms of service and conditions. Read our comprehensive terms and conditions for using our website and services.',
    url: '/terms',
  })
}

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Legal documents and terms"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Scale className="w-4 h-4 mr-2" />
              Legal Terms
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              Please read these terms carefully before using our services and making purchases.
            </p>
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-16 max-w-6xl">

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Key Terms */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-700" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Key Terms & Conditions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Acceptance of Terms</h4>
                  <p className="text-gray-600 leading-relaxed">
                    By using our website and services, you agree to be bound by these terms and conditions.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-25 border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Orders & Payment</h4>
                  <p className="text-gray-600 leading-relaxed">
                    All orders are subject to acceptance. We accept major payment methods and Cash on Delivery.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-25 border border-amber-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Returns Policy</h4>
                  <p className="text-gray-600 leading-relaxed">
                    30-day return policy for unused items in original packaging. Refunds processed within 3-5 business days.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
              <CardHeader className="relative pb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Scale className="h-4 w-4 text-blue-700" />
                  </div>
                  <CardTitle className="text-xl text-white">
                    Legal & Compliance
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="grid gap-6">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-blue-300 mb-2">User Responsibilities</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Provide accurate information</li>
                      <li>• Maintain account security</li>
                      <li>• Use services lawfully</li>
                      <li>• Respect intellectual property</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-blue-300 mb-2">Our Commitments</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Quality products and services</li>
                      <li>• Secure payment processing</li>
                      <li>• Timely delivery</li>
                      <li>• Customer support</li>
                    </ul>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <h4 className="font-semibold text-white mb-4">Legal Questions?</h4>
                  <div className="grid gap-3 text-sm">
                    <p className="text-gray-300"><strong className="text-white">Email:</strong> legal@rmstore.com</p>
                    <p className="text-gray-300"><strong className="text-white">Phone:</strong> +20 100 123 4567</p>
                  </div>
                  <p className="text-gray-300 mt-3 text-sm">
                    <strong className="text-white">Address:</strong> 123 Furniture Street, New Cairo, Egypt
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
