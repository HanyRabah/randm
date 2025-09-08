'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Save,
  ExternalLink
} from 'lucide-react'

interface OrderStatusManagerProps {
  order: {
    id: string
    orderNumber: string
    status: string
    courier?: string
    airwayBill?: string
    trackingUrl?: string
    estimatedDelivery?: string
    deliveredAt?: string
    notes?: string
  }
  onStatusUpdate?: (updatedOrder: any) => void
}

const statusOptions = [
  { value: 'PENDING', label: 'Order Placed', icon: Package, color: 'bg-blue-500' },
  { value: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'PACKED', label: 'Order Packed', icon: Package, color: 'bg-orange-500' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, color: 'bg-purple-500' },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'bg-green-600' },
  { value: 'FAILED', label: 'Delivery Failed', icon: AlertCircle, color: 'bg-red-500' },
  { value: 'CANCELED', label: 'Order Canceled', icon: Clock, color: 'bg-gray-500' }
]

export function OrderStatusManager({ order, onStatusUpdate }: OrderStatusManagerProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    status: order.status,
    courier: order.courier || '',
    airwayBill: order.airwayBill || '',
    trackingUrl: order.trackingUrl || '',
    estimatedDelivery: order.estimatedDelivery ? 
      new Date(order.estimatedDelivery).toISOString().slice(0, 16) : '',
    notes: order.notes || ''
  })

  const currentStatus = statusOptions.find(s => s.value === order.status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          estimatedDelivery: formData.estimatedDelivery ? 
            new Date(formData.estimatedDelivery).toISOString() : undefined
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Order Updated',
          description: 'Order status and tracking details have been updated successfully.',
        })
        
        if (onStatusUpdate) {
          onStatusUpdate(result.order)
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update order status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Order Status & Tracking</span>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Order #{order.orderNumber}</span>
          {currentStatus && (
            <Badge className={`${currentStatus.color} text-white`}>
              <currentStatus.icon className="h-3 w-3 mr-1" />
              {currentStatus.label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select order status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <status.icon className="h-4 w-4" />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courier">Courier Service</Label>
              <Input
                id="courier"
                value={formData.courier}
                onChange={(e) => setFormData(prev => ({ ...prev, courier: e.target.value }))}
                placeholder="e.g., Aramex, DHL, FedEx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airwayBill">Tracking Number</Label>
              <Input
                id="airwayBill"
                value={formData.airwayBill}
                onChange={(e) => setFormData(prev => ({ ...prev, airwayBill: e.target.value }))}
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          {/* Tracking URL */}
          <div className="space-y-2">
            <Label htmlFor="trackingUrl">Tracking URL</Label>
            <div className="flex space-x-2">
              <Input
                id="trackingUrl"
                type="url"
                value={formData.trackingUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, trackingUrl: e.target.value }))}
                placeholder="https://tracking.courier.com/..."
                className="flex-1"
              />
              {formData.trackingUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a 
                    href={formData.trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="space-y-2">
            <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
            <Input
              id="estimatedDelivery"
              type="datetime-local"
              value={formData.estimatedDelivery}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any internal notes about this order..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Order...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Order Status
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
