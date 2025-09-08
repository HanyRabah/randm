'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { verifyOrderOTP } from '@/server/actions/orders'
import { sendOTP } from '@/lib/otp'
import { Loader2, Shield } from 'lucide-react'

interface OTPVerificationProps {
  orderNumber: string
  phone: string
}

export function OTPVerification({ orderNumber, phone }: OTPVerificationProps) {
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      })
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyOrderOTP(orderNumber, otp)
      
      if (result.success) {
        toast({
          title: 'Order Verified!',
          description: 'Your order has been confirmed and will be processed shortly.',
        })
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        toast({
          title: 'Verification Failed',
          description: result.error || 'Invalid OTP. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    try {
      const result = await sendOTP(phone)
      
      if (result) {
        toast({
          title: 'OTP Sent',
          description: 'A new OTP has been sent to your phone.',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send OTP',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Shield className="w-5 h-5" />
          <span>Verify Your Order</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-orange-700">
            Please enter the 6-digit OTP sent to <strong>{phone}</strong> to confirm your order.
          </p>
          
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="flex-1"
            />
            <Button 
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-orange-600">Didn't receive the code?</span>
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-orange-600 hover:text-orange-700 p-0 h-auto"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
