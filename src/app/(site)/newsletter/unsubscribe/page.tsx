'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function UnsubscribePage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [unsubscribing, setUnsubscribing] = useState(false)
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'unsubscribed' | 'already_unsubscribed'>('loading')
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setLoading(false)
      return
    }

    fetchSubscriberInfo()
  }, [token, email])

  const fetchSubscriberInfo = async () => {
    try {
      const params = new URLSearchParams({ token: token! })
      if (email) params.append('email', email)

      const response = await fetch(`/api/newsletter/unsubscribe?${params}`)
      const data = await response.json()

      if (response.ok) {
        setSubscriberInfo(data.subscriber)
        setStatus(data.subscriber.isActive ? 'valid' : 'already_unsubscribed')
      } else {
        setStatus('invalid')
        toast({
          title: 'Error',
          description: data.error || 'Invalid unsubscribe link',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching subscriber info:', error)
      setStatus('invalid')
      toast({
        title: 'Error',
        description: 'Failed to load unsubscribe page',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!token) return

    setUnsubscribing(true)

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          email: email || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('unsubscribed')
        toast({
          title: 'Success',
          description: data.message || 'Successfully unsubscribed from newsletter'
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to unsubscribe',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from newsletter',
        variant: 'destructive'
      })
    } finally {
      setUnsubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading unsubscribe page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        {status === 'invalid' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Invalid Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This unsubscribe link is invalid or has expired. If you're trying to unsubscribe 
                from our newsletter, please contact our support team.
              </p>
              <Button asChild className="w-full">
                <a href="/contact">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'already_unsubscribed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Already Unsubscribed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The email address <strong>{subscriberInfo?.email}</strong> is already 
                unsubscribed from our newsletter.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <a href="/newsletter">Subscribe Again</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'valid' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Unsubscribe from Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to unsubscribe <strong>{subscriberInfo?.email}</strong> from 
                our newsletter?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You'll no longer receive updates about new products, exclusive offers, and design tips.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleUnsubscribe}
                  disabled={unsubscribing}
                  variant="destructive"
                  className="w-full"
                >
                  {unsubscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unsubscribing...
                    </>
                  ) : (
                    'Yes, Unsubscribe'
                  )}
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/">Keep Subscription & Go Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'unsubscribed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Successfully Unsubscribed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You have been successfully unsubscribed from our newsletter. We're sorry to see you go!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you change your mind, you can always subscribe again from our website.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <a href="/newsletter">Subscribe Again</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/">Return to Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
