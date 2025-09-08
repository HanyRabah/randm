'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from '@/components/ui/use-toast'

interface CartItem {
  id: string
  productId: string
  variantId?: string
  productTitle: string
  productSlug: string
  variantTitle: string
  price: number
  quantity: number
  image: string
  options: Array<{
    name: string
    value: string
  }>
}

interface CartContextType {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [itemCount, setItemCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const cartData = await response.json()
        setItems(cartData.items || [])
        setTotal(cartData.total || 0)
        setItemCount(cartData.itemCount || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, variantId?: string, quantity = 1) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Added to cart',
          description: 'Item has been added to your cart',
        })
        await fetchCart()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add item to cart',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchCart()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update cart',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to update cart',
        variant: 'destructive',
      })
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Removed from cart',
          description: 'Item has been removed from your cart',
        })
        await fetchCart()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to remove item',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      })
    }
  }

  const refreshCart = async () => {
    setIsLoading(true)
    await fetchCart()
  }

  // Fetch cart on mount and when authentication status changes
  useEffect(() => {
    if (status !== 'loading') {
      fetchCart()
    }
  }, [status])

  // Refresh cart when user signs in/out
  useEffect(() => {
    if (status === 'authenticated' || status === 'unauthenticated') {
      fetchCart()
    }
  }, [session?.user?.email, status])

  const value: CartContextType = {
    items,
    total,
    itemCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
