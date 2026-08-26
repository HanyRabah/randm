'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { checkoutSchema } from '@/lib/validations'
import { createOrder } from '@/server/actions/checkout'
import { useToast } from '@/components/ui/use-toast'
import { Truck, CreditCard, Phone, MapPin, Plus, User } from 'lucide-react'
import Link from 'next/link'

type CheckoutFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  line1: string
  line2?: string
  city: string
  region: string
  postalCode?: string
  country: string
  requireOTP: boolean
  addressId?: string
}

interface Address {
  id: string
  street: string
  city: string
  governorate: string
  isDefault: boolean
}

export function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema.extend({
      requireOTP: checkoutSchema.shape.requireOTP || false,
    })),
    defaultValues: {
      country: 'Egypt',
      requireOTP: false,
    },
  })

  const requireOTP = watch('requireOTP')

  // Fetch user addresses if authenticated
  useEffect(() => {
    const fetchAddresses = async () => {
      if (session?.user?.email) {
        setIsLoadingAddresses(true)
        try {
          const response = await fetch('/api/user/addresses')
          if (response.ok) {
            const data = await response.json()
            setAddresses(data)
            
            // Set default address if available
            const defaultAddress = data.find((addr: Address) => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
              setValue('addressId', defaultAddress.id)
            }
          }
        } catch (error) {
          console.error('Error fetching addresses:', error)
        } finally {
          setIsLoadingAddresses(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchAddresses()
    }
  }, [session, status, setValue])

  // Pre-fill user information if authenticated
  useEffect(() => {
    if (session?.user) {
      setValue('email', session.user.email || '')
      setValue('firstName', session.user.name?.split(' ')[0] || '')
      setValue('lastName', session.user.name?.split(' ').slice(1).join(' ') || '')
    }
  }, [session, setValue])

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    setValue('addressId', addressId)
    
    const selectedAddress = addresses.find(addr => addr.id === addressId) as any
    if (selectedAddress) {
      setValue('line1', selectedAddress.line1 ?? selectedAddress.street)
      setValue('city', selectedAddress.city)
      setValue('region', selectedAddress.state ?? selectedAddress.governorate)
    }
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const result = await createOrder(formData)

      if (result.success && result.orderId) {
        toast({
          title: 'Order placed successfully!',
          description: 'You will receive a confirmation shortly.',
        })

        if (requireOTP) {
          router.push(`/checkout/verify-otp?orderId=${result.orderId}`)
        } else {
          router.push(`/order/${result.orderId}`)
        }
      } else {
        toast({
          title: 'Order failed',
          description: result.error || 'Failed to place order',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Authentication Status */}
      {status === 'unauthenticated' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Sign in for faster checkout</p>
                <p className="text-sm text-blue-700">Access your saved addresses and order history</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/customer-signin">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Contact Information</span>
            {session?.user && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Signed in as {session.user.email})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+201234567890"
              {...register('phone')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Selection for Authenticated Users */}
      {session?.user && addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Select Delivery Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading addresses...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddressSelect(address.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedAddressId === address.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}>
                          {selectedAddressId === address.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{address.street}</p>
                          {address.isDefault && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.governorate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors border-dashed ${
                    useNewAddress
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setUseNewAddress(true)
                    setSelectedAddressId('')
                    setValue('addressId', '')
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Use a new address</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      <Card className={session?.user && addresses.length > 0 && !useNewAddress && selectedAddressId ? 'opacity-50' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Delivery Address</span>
            {session?.user && addresses.length > 0 && !useNewAddress && selectedAddressId && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Using saved address)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="line1">Street Address *</Label>
            <Input
              id="line1"
              {...register('line1')}
              className={errors.line1 ? 'border-destructive' : ''}
            />
            {errors.line1 && (
              <p className="text-sm text-destructive mt-1">{errors.line1.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
            <Input
              id="line2"
              {...register('line2')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="region">Region/State *</Label>
              <Input
                id="region"
                {...register('region')}
                className={errors.region ? 'border-destructive' : ''}
              />
              {errors.region && (
                <p className="text-sm text-destructive mt-1">{errors.region.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-medium">Cash on Delivery (COD)</h3>
                <p className="text-sm text-muted-foreground">
                  Pay with cash when your order is delivered to your doorstep
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* OTP Verification Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireOTP"
              checked={requireOTP}
              onCheckedChange={(checked) => setValue('requireOTP', checked as boolean)}
            />
            <Label htmlFor="requireOTP" className="text-sm">
              Require SMS verification before delivery (recommended)
            </Label>
          </div>
          {requireOTP && (
            <p className="text-sm text-muted-foreground mt-2">
              You will receive an SMS with a verification code that must be provided to the delivery person.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Placing Order...' : 'Place Order'}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        By placing this order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}
