import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Crown, Star, ArrowRight, Sparkles } from 'lucide-react'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import Image from 'next/image'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return await generateSeoMetadata({
    title: 'Contact Us - Get in Touch',
    description: 'Contact our customer service team for support, inquiries, or feedback. Find our business hours, phone, email, and send us a message directly.',
    url: '/contact',
  })
}

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Customer service and support"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <MessageCircle className="w-4 h-4 mr-2" />
              24/7 Support
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Have questions about our premium furniture collection? Our expert team is here to help you create your dream space.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto py-16">

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl transform rotate-1"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-6">
                  <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200 w-fit">
                    <Send className="w-4 h-4 mr-2" />
                    Contact Form
                  </Badge>
                  <CardTitle className="text-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Send us a Message
                  </CardTitle>
                  <p className="text-gray-600">We'll get back to you within 24 hours</p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                        <Input id="firstName" placeholder="Ahmed" required className="border-gray-200 focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                        <Input id="lastName" placeholder="Mohamed" required className="border-gray-200 focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input id="email" type="email" placeholder="ahmed@example.com" required className="border-gray-200 focus:border-blue-500 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+20 100 123 4567" className="border-gray-200 focus:border-blue-500 focus:ring-blue-500" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                      <Select>
                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="order">Order Support</SelectItem>
                          <SelectItem value="product">Product Question</SelectItem>
                          <SelectItem value="shipping">Shipping & Delivery</SelectItem>
                          <SelectItem value="return">Returns & Exchanges</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        required
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-6">
                  <Badge className="mb-4 bg-green-100 text-green-800 border-green-200 w-fit">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Info
                  </Badge>
                  <CardTitle className="text-2xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-25 border border-amber-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600 leading-relaxed">
                        123 Furniture Street<br />
                        New Cairo, Cairo Governorate<br />
                        Egypt, 11835
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">+20 100 123 4567</p>
                      <p className="text-sm text-gray-500">Customer Service</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-25 border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">info@rmstore.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-25 border border-purple-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>Saturday - Thursday: 9:00 AM - 6:00 PM</p>
                        <p>Friday: 2:00 PM - 6:00 PM</p>
                        <p className="text-sm text-gray-500">Cairo Time (GMT+2)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
                <CardHeader className="relative pb-6">
                  <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30 w-fit">
                    <Star className="w-4 h-4 mr-2" />
                    Quick Help
                  </Badge>
                  <CardTitle className="text-2xl text-white">
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-amber-300 mb-2">How long does delivery take?</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Standard delivery takes 3-7 business days within Cairo and Giza. Express delivery is available for 1-2 business days with additional fees.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-amber-300 mb-2">Do you offer assembly service?</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Yes, we offer professional assembly service for an additional fee. You can add this service during checkout or contact us after your purchase.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                    <h4 className="font-semibold text-amber-300 mb-2">What's your return policy?</h4>
                    <p className="text-gray-300 leading-relaxed">
                      We offer a 30-day return policy for unused items in original packaging. Cash on delivery orders can be returned for store credit or exchange.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
