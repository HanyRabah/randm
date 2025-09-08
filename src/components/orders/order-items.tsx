'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  id: string
  productTitle: string
  productSlug: string
  variantSku: string
  quantity: number
  price: number
  image: string
  options: Array<{
    name: string
    value: string
  }>
}

interface OrderItemsProps {
  items: OrderItem[]
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Order Items ({items.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex space-x-4 p-4 border rounded-lg">
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.productTitle}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/product/${item.productSlug}`}
                  className="font-medium text-sm hover:text-primary transition-colors"
                >
                  {item.productTitle}
                </Link>
                {item.variantSku !== 'Default' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    SKU: {item.variantSku}
                  </p>
                )}
                {item.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.options.map((option, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {option.name}: {option.value}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-medium text-sm">
                    EGP {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
