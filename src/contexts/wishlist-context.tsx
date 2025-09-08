'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

interface WishlistItem {
  id: string
  addedAt: string
  product: {
    id: string
    title: string
    slug: string
    basePrice: number
    comparePrice: number | null
    category: { name: string; slug: string }
    image: string
    inStock: boolean
    variants: number
    colors: string[]
  }
}

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  loading: boolean
  isInWishlist: (productId: string) => boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

interface WishlistProviderProps {
  children: ReactNode
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = async () => {
    if (status !== 'authenticated' || !session?.user?.email) {
      setItems([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else {
        console.error('Failed to fetch wishlist')
        setItems([])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    if (status !== 'authenticated') {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Added to wishlist',
          description: 'Product has been added to your wishlist.',
        })
        await fetchWishlist() // Refresh the wishlist
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to add to wishlist',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast({
        title: 'Error',
        description: 'Failed to add to wishlist',
        variant: 'destructive',
      })
    }
  }

  const removeFromWishlist = async (productId: string) => {
    const item = items.find(item => item.product.id === productId)
    if (!item) return

    try {
      const response = await fetch(`/api/wishlist/${item.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Removed from wishlist',
          description: 'Product has been removed from your wishlist.',
        })
        await fetchWishlist() // Refresh the wishlist
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to remove from wishlist',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove from wishlist',
        variant: 'destructive',
      })
    }
  }

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product.id === productId)
  }

  const refreshWishlist = async () => {
    await fetchWishlist()
  }

  // Fetch wishlist when session changes
  useEffect(() => {
    fetchWishlist()
  }, [session, status])

  const value: WishlistContextType = {
    items,
    itemCount: items.length,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}
