import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye, Crown } from 'lucide-react'
import Image from 'next/image'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return await generateSeoMetadata({
    title: 'Privacy Policy - Your Data Protection',
    description: 'Our privacy policy. Learn how we collect, use, and protect your personal information with industry-leading security measures.',
    url: '/privacy',
  })
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Data privacy and security"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Data Protection
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 mb-4 leading-relaxed">
              Your privacy is our priority. Learn how we protect and handle your personal information.
            </p>
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-16 max-w-6xl">

          <div className="space-y-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-700" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    1. Information We Collect
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, 
                    make a purchase, or contact us. This may include your name, email address, phone number, 
                    shipping address, and payment information.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-25 border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We automatically collect certain information about your use of our website, including 
                    your IP address, browser type, pages visited, and the time and date of your visits.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-25 border border-amber-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Cookies and Tracking</h4>
                  <p className="text-gray-600 leading-relaxed">
                    We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                    and personalize content and advertisements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
              <CardHeader className="relative pb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-700" />
                  </div>
                  <CardTitle className="text-xl text-white">
                    Data Protection & Contact
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-green-300 mb-2">Your Rights</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Access and update your information</li>
                      <li>• Request data deletion</li>
                      <li>• Opt-out of marketing</li>
                      <li>• Data portability requests</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-green-300 mb-2">Security Measures</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• SSL encryption</li>
                      <li>• Secure data storage</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls</li>
                    </ul>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <h4 className="font-semibold text-white mb-4">Contact Our Privacy Team</h4>
                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <p className="text-gray-300"><strong className="text-white">Email:</strong> privacy@rmstore.com</p>
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
