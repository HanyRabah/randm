import Link from 'next/link'
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'
import { getSeoSettings } from '@/lib/seo'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'

export async function Footer() {
  const seoSettings = await getSeoSettings()
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/shipping-returns" className="text-muted-foreground hover:text-foreground">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="/press" className="text-muted-foreground hover:text-foreground">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <NewsletterSignup 
              variant="compact" 
              source="footer"
            />
          </div>
        </div>
        {/* Social Media Links */}
        {(seoSettings.facebookUrl || seoSettings.instagramUrl || seoSettings.twitterHandle || seoSettings.linkedinUrl) && (
          <div className="border-t mt-8 pt-8">
            <div className="flex justify-center space-x-6 mb-6">
              {seoSettings.facebookUrl && (
                <Link href={seoSettings.facebookUrl} className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {seoSettings.instagramUrl && (
                <Link href={seoSettings.instagramUrl} className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {seoSettings.twitterHandle && (
                <Link href={`https://twitter.com/${seoSettings.twitterHandle.replace('@', '')}`} className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
              {seoSettings.linkedinUrl && (
                <Link href={seoSettings.linkedinUrl} className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        )}
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 {seoSettings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
