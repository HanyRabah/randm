'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'

interface Coupon {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED' | 'FREESHIP'
  value: number
  minSubtotal?: number
  maxRedemptions?: number
  perCustomer: number
  usageCount: number
  startsAt: string
  endsAt?: string
  isActive: boolean
}

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED' | 'FREESHIP',
    value: '',
    minSubtotal: '',
    maxRedemptions: '',
    perCustomer: '1',
    startsAt: '',
    endsAt: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupon()
  }, [params.id])

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch coupon')
      
      const data = await response.json()
      setCoupon(data)
      
      setFormData({
        code: data.code || '',
        type: data.type || 'PERCENT',
        value: data.value?.toString() || '',
        minSubtotal: data.minSubtotal?.toString() || '',
        maxRedemptions: data.maxRedemptions?.toString() || '',
        perCustomer: data.perCustomer?.toString() || '1',
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16) : '',
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().slice(0, 16) : '',
        isActive: data.isActive ?? true
      })
    } catch (error) {
      console.error('Error fetching coupon:', error)
      toast({
        title: 'Error',
        description: 'Failed to load coupon',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        minSubtotal: formData.minSubtotal ? parseFloat(formData.minSubtotal) : null,
        maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : null,
        perCustomer: parseInt(formData.perCustomer),
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        isActive: formData.isActive
      }

      const response = await fetch(`/api/admin/coupons/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to update coupon')

      toast({
        title: 'Success',
        description: 'Coupon updated successfully'
      })

      router.push('/admin/coupons')
    } catch (error) {
      console.error('Error updating coupon:', error)
      toast({
        title: 'Error',
        description: 'Failed to update coupon',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Coupon Not Found</h1>
        <Button asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Coupon</h1>
          <p className="text-muted-foreground">Update coupon information</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Information</CardTitle>
              <CardDescription>
                Update the basic information about your coupon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">Percentage</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="FREESHIP">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {formData.type === 'PERCENT' ? 'Percentage (%)' : 
                       formData.type === 'FIXED' ? 'Amount ($)' : 'Value'}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === 'PERCENT' ? '1' : '0.01'}
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', e.target.value)}
                      placeholder={formData.type === 'PERCENT' ? '20' : '50.00'}
                      required
                      disabled={formData.type === 'FREESHIP'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minSubtotal">Minimum Subtotal ($)</Label>
                    <Input
                      id="minSubtotal"
                      type="number"
                      step="0.01"
                      value={formData.minSubtotal}
                      onChange={(e) => handleInputChange('minSubtotal', e.target.value)}
                      placeholder="100.00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxRedemptions">Max Total Uses</Label>
                    <Input
                      id="maxRedemptions"
                      type="number"
                      value={formData.maxRedemptions}
                      onChange={(e) => handleInputChange('maxRedemptions', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perCustomer">Uses Per Customer</Label>
                    <Input
                      id="perCustomer"
                      type="number"
                      value={formData.perCustomer}
                      onChange={(e) => handleInputChange('perCustomer', e.target.value)}
                      placeholder="1"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startsAt">Start Date & Time</Label>
                    <Input
                      id="startsAt"
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) => handleInputChange('startsAt', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endsAt">End Date & Time (Optional)</Label>
                    <Input
                      id="endsAt"
                      type="datetime-local"
                      value={formData.endsAt}
                      onChange={(e) => handleInputChange('endsAt', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Coupon
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/coupons">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline">
                    {coupon.type === 'PERCENT' ? 'Percentage' : 
                     coupon.type === 'FIXED' ? 'Fixed Amount' : 'Free Shipping'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uses</span>
                  <span className="text-sm text-muted-foreground">
                    {coupon.usageCount} / {coupon.maxRedemptions || '∞'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coupon Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Code: {formData.code || 'COUPON'}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.type === 'PERCENT' && `${formData.value || 0}% off`}
                  {formData.type === 'FIXED' && `$${formData.value || 0} off`}
                  {formData.type === 'FREESHIP' && 'Free shipping'}
                </p>
                {formData.minSubtotal && (
                  <p className="text-xs text-muted-foreground">
                    Minimum order: ${formData.minSubtotal}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
