'use client'

import { OrderStatus } from '@prisma/client'
import { CheckCircle, Circle, Clock, Truck, Package, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderTrackerProps {
  status: OrderStatus
  otpVerified: boolean
  codCollected: boolean
  createdAt: Date
  updatedAt: Date
}

const statusSteps = [
  {
    key: 'PENDING',
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: Circle,
  },
  {
    key: 'CONFIRMED',
    label: 'Order Confirmed',
    description: 'Your order has been confirmed',
    icon: CheckCircle,
  },
  {
    key: 'PACKED',
    label: 'Order Packed',
    description: 'Your order is being prepared',
    icon: Package,
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    description: 'Your order is on the way',
    icon: Truck,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    description: 'Your order has been delivered',
    icon: Home,
  },
]

const getStatusIndex = (status: OrderStatus) => {
  const index = statusSteps.findIndex(step => step.key === status)
  return index === -1 ? 0 : index
}

export function OrderTracker({ 
  status, 
  otpVerified, 
  codCollected, 
  createdAt, 
  updatedAt 
}: OrderTrackerProps) {
  const currentStatusIndex = getStatusIndex(status)
  const isCanceled = status === 'CANCELED'
  const isFailed = status === 'FAILED'

  if (isCanceled || isFailed) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Circle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Order {isCanceled ? 'Canceled' : 'Failed'}
          </h2>
          <p className="text-muted-foreground">
            {isCanceled 
              ? 'Your order has been canceled. If you have any questions, please contact support.'
              : 'There was an issue with your delivery. Please contact support for assistance.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Order Status</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {updatedAt.toLocaleDateString()} at {updatedAt.toLocaleTimeString()}
        </div>
      </div>

      {/* OTP Status */}
      {!otpVerified && status === 'PENDING' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Awaiting OTP Verification</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Please verify your phone number to confirm your order.
          </p>
        </div>
      )}

      {/* Status Steps */}
      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStatusIndex
          const isCurrent = index === currentStatusIndex
          const Icon = step.icon

          return (
            <div key={step.key} className="flex items-start space-x-4">
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
                isCompleted 
                  ? "bg-green-100 border-green-500 text-green-600"
                  : isCurrent
                  ? "bg-blue-100 border-blue-500 text-blue-600"
                  : "bg-gray-100 border-gray-300 text-gray-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "font-medium",
                    isCompleted ? "text-green-800" : isCurrent ? "text-blue-800" : "text-gray-500"
                  )}>
                    {step.label}
                  </h3>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className={cn(
                  "text-sm mt-1",
                  isCompleted ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-400"
                )}>
                  {step.description}
                </p>
                
                {/* Special messages */}
                {step.key === 'DELIVERED' && isCompleted && (
                  <div className="mt-2">
                    {codCollected ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        COD Collected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        COD Pending
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Estimated Delivery */}
      {status !== 'DELIVERED' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Estimated Delivery</h4>
          <p className="text-sm text-blue-700">
            Your order will be delivered within 2-5 business days from confirmation.
          </p>
        </div>
      )}
    </div>
  )
}
