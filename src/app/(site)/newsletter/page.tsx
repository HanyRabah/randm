import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Gift, Zap, Users } from 'lucide-react'

export default function NewsletterPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Stay Connected</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of furniture enthusiasts and get exclusive access to new collections, 
            design tips, and special offers delivered straight to your inbox.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Gift className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Exclusive Offers</h3>
              <p className="text-sm text-gray-600">
                Get early access to sales and subscriber-only discounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">New Arrivals</h3>
              <p className="text-sm text-gray-600">
                Be the first to know about our latest furniture collections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Design Tips</h3>
              <p className="text-sm text-gray-600">
                Weekly interior design inspiration and decorating advice
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-gray-600">
                Join our community of design lovers and furniture enthusiasts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup Form */}
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup 
            source="newsletter-page" 
            showPreferences={true}
          />
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">How often will I receive emails?</h3>
              <p className="text-gray-600 text-sm">
                You can choose to receive our newsletter weekly or monthly. We respect your inbox 
                and only send valuable content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I unsubscribe anytime?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely! Every email includes an unsubscribe link, and you can opt out 
                with just one click.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What type of content will I receive?</h3>
              <p className="text-gray-600 text-sm">
                New product announcements, exclusive sales, design tips, room inspiration, 
                and seasonal decorating ideas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my email address safe?</h3>
              <p className="text-gray-600 text-sm">
                We never share your email address with third parties. Your privacy is 
                important to us and we follow strict data protection guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
