'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'inline'
  source?: string
  className?: string
  showPreferences?: boolean
}

export function NewsletterSignup({ 
  variant = 'default', 
  source = 'direct',
  className,
  showPreferences = false
}: NewsletterSignupProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    preferences: {
      frequency: 'weekly' as 'weekly' | 'monthly',
      promotions: true
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          preferences: showPreferences ? formData.preferences : undefined,
          source
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      toast({
        title: 'Success!',
        description: data.message || 'Successfully subscribed to newsletter!'
      })

      setIsSubscribed(true)
      
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        preferences: {
          frequency: 'weekly',
          promotions: true
        }
      })
    } catch (error) {
      console.error('Error subscribing:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to subscribe to newsletter',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubscribed && variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-green-600', className)}>
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium">Subscribed!</span>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold">Stay Updated</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get the latest furniture trends and exclusive offers.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-amber-600" />
          Subscribe to Our Newsletter
        </CardTitle>
        <p className="text-sm text-gray-600">
          Stay updated with the latest furniture trends, exclusive offers, and design inspiration.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name (Optional)
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name (Optional)
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isSubmitting}
              required
            />
          </div>

          {showPreferences && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Preferences</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Frequency
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={formData.preferences.frequency === 'weekly'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, frequency: 'weekly' }
                      }))}
                      className="mr-2"
                    />
                    Weekly
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={formData.preferences.frequency === 'monthly'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, frequency: 'monthly' }
                      }))}
                      className="mr-2"
                    />
                    Monthly
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="promotions"
                  checked={formData.preferences.promotions}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, promotions: !!checked }
                  }))}
                />
                <label htmlFor="promotions" className="text-sm text-gray-700">
                  I want to receive promotional offers and discounts
                </label>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe to Newsletter'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
