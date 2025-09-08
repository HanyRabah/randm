'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ExternalLink,
  Phone,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'

interface OrderStatusTrackerProps {
  order: {
    id: string
    orderNumber: string
    status: string
    courier?: string
    airwayBill?: string
    trackingUrl?: string
    estimatedDelivery?: string
    deliveredAt?: string
    contactPhone: string
    createdAt: string
    updatedAt: string
    shippingAddress?: {
      street: string
      city: string
      governorate: string
    }
  }
}

const statusConfig = {
  PENDING: {
    label: 'Order Placed',
    description: 'Your order has been received and is being processed',
    icon: Package,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  CONFIRMED: {
    label: 'Order Confirmed',
    description: 'Your order has been confirmed and is being prepared',
    icon: CheckCircle,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  PACKED: {
    label: 'Order Packed',
    description: 'Your order has been packed and is ready for shipment',
    icon: Package,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    description: 'Your order is on its way to your address',
    icon: Truck,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  DELIVERED: {
    label: 'Delivered',
    description: 'Your order has been successfully delivered',
    icon: CheckCircle,
    color: 'bg-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  FAILED: {
    label: 'Delivery Failed',
    description: 'Delivery attempt failed, please contact support',
    icon: Clock,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  CANCELED: {
    label: 'Order Canceled',
    description: 'Your order has been canceled',
    icon: Clock,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
}

const statusOrder = ['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export function OrderStatusTracker({ order }: OrderStatusTrackerProps) {
  const currentStatus = statusConfig[order.status as keyof typeof statusConfig]
  const currentStatusIndex = statusOrder.indexOf(order.status)

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className={`${currentStatus.borderColor} ${currentStatus.bgColor}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentStatus.color} text-white`}>
              <currentStatus.icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className={currentStatus.textColor}>
                {currentStatus.label}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStatus.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Order Number</p>
              <p className="text-muted-foreground">{order.orderNumber}</p>
            </div>
            <div>
              <p className="font-medium">Last Updated</p>
              <p className="text-muted-foreground">
                {format(new Date(order.updatedAt), 'MMM dd, yyyy at h:mm a')}
              </p>
            </div>
            {order.estimatedDelivery && (
              <div>
                <p className="font-medium">Estimated Delivery</p>
                <p className="text-muted-foreground">
                  {format(new Date(order.estimatedDelivery), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {order.deliveredAt && (
              <div>
                <p className="font-medium">Delivered On</p>
                <p className="text-muted-foreground">
                  {format(new Date(order.deliveredAt), 'MMM dd, yyyy at h:mm a')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Details */}
      {(order.courier || order.airwayBill || order.trackingUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Shipping Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.courier && (
              <div>
                <p className="font-medium">Courier Service</p>
                <p className="text-muted-foreground">{order.courier}</p>
              </div>
            )}
            {order.airwayBill && (
              <div>
                <p className="font-medium">Tracking Number</p>
                <p className="text-muted-foreground font-mono">{order.airwayBill}</p>
              </div>
            )}
            {order.trackingUrl && (
              <div>
                <Button asChild variant="outline" size="sm">
                  <a 
                    href={order.trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Track Package</span>
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Delivery Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.governorate}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusOrder.map((status, index) => {
              const config = statusConfig[status as keyof typeof statusConfig]
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex
              const isUpcoming = index > currentStatusIndex

              return (
                <div key={status} className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? config.color + ' text-white' 
                      : isUpcoming 
                        ? 'bg-gray-200 text-gray-400'
                        : config.color + ' text-white'
                  }`}>
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isCurrent ? config.textColor : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {config.label}
                    </p>
                    <p className={`text-sm ${
                      isCurrent ? 'text-muted-foreground' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {config.description}
                    </p>
                  </div>
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you have any questions about your order, please contact us:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${order.contactPhone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/contact">
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
