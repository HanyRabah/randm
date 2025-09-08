'use server'

import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { addToCartSchema, updateCartItemSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

async function getOrCreateCart() {
  const session = await getServerSession(authOptions)
  const cookieStore = cookies()
  let sessionId = cookieStore.get('cart-session')?.value

  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    cookieStore.set('cart-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  const includeOptions = {
    items: {
      include: {
        product: {
          include: {
            media: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
        variant: {
          include: {
            options: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    },
  }

  // If user is authenticated, try to find their cart first
  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user) {
      // Look for existing user cart
      let userCart = await db.cart.findFirst({
        where: { userId: user.id },
        include: includeOptions,
      })

      // If user has a cart, update it with current session
      if (userCart) {
        if (userCart.sessionId !== sessionId) {
          userCart = await db.cart.update({
            where: { id: userCart.id },
            data: { sessionId },
            include: includeOptions,
          })
        }
        return userCart
      }

      // Check if there's a session cart to merge
      const sessionCart = await db.cart.findUnique({
        where: { sessionId },
        include: includeOptions,
      })

      if (sessionCart) {
        // Merge session cart with user account
        const updatedCart = await db.cart.update({
          where: { id: sessionCart.id },
          data: { userId: user.id },
          include: includeOptions,
        })
        return updatedCart
      }

      // Create new cart for authenticated user
      const newCart = await db.cart.create({
        data: { 
          sessionId,
          userId: user.id 
        },
        include: includeOptions,
      })
      return newCart
    }
  }

  // Handle anonymous users (no authentication)
  let cart = await db.cart.findUnique({
    where: { sessionId },
    include: includeOptions,
  })

  if (!cart) {
    cart = await db.cart.create({
      data: { sessionId },
      include: includeOptions,
    })
  }

  return cart
}

export async function addToCart(formData: FormData) {
  try {
    const data = {
      productId: formData.get('productId') as string,
      variantId: formData.get('variantId') as string | null,
      quantity: parseInt(formData.get('quantity') as string),
    }

    const validatedData = addToCartSchema.parse(data)
    const cart = await getOrCreateCart()

    // Check if product exists and is published
    const product = await db.product.findUnique({
      where: { id: validatedData.productId, status: 'PUBLISHED' },
      include: {
        variants: validatedData.variantId
          ? { where: { id: validatedData.variantId } }
          : { where: { isDefault: true }, take: 1 },
      },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    const variant = validatedData.variantId
      ? product.variants.find((v: any) => v.id === validatedData.variantId)
      : product.variants[0]

    if (!variant) {
      return { success: false, error: 'Product variant not found' }
    }

    // Check inventory
    if (variant.inventory < validatedData.quantity) {
      return { success: false, error: 'Insufficient inventory' }
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
        variantId: validatedData.variantId || null,
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + validatedData.quantity
      
      if (variant.inventory < newQuantity) {
        return { success: false, error: 'Insufficient inventory' }
      }

      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Create new cart item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          variantId: validatedData.variantId || null,
          quantity: validatedData.quantity,
        },
      })
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Add to cart error:', error)
    return { success: false, error: 'Failed to add item to cart' }
  }
}

export async function updateCartItem(itemId: string, formData: FormData) {
  try {
    const data = {
      quantity: parseInt(formData.get('quantity') as string),
    }

    const validatedData = updateCartItemSchema.parse(data)
    const cart = await getOrCreateCart()

    const cartItem = await db.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    })

    if (!cartItem) {
      return { success: false, error: 'Cart item not found' }
    }

    if (validatedData.quantity === 0) {
      // Remove item
      await db.cartItem.delete({
        where: { id: itemId },
      })
    } else {
      // Check inventory
      if (cartItem.variant && cartItem.variant.inventory < validatedData.quantity) {
        return { success: false, error: 'Insufficient inventory' }
      }

      // Update quantity
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity: validatedData.quantity },
      })
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Update cart item error:', error)
    return { success: false, error: 'Failed to update cart item' }
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const cart = await getOrCreateCart()

    await db.cartItem.delete({
      where: { id: itemId, cartId: cart.id },
    })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Remove from cart error:', error)
    return { success: false, error: 'Failed to remove item from cart' }
  }
}

export async function getCart() {
  try {
    const cart = await getOrCreateCart()
    return cart
  } catch (error) {
    console.error('Get cart error:', error)
    return null
  }
}

export async function clearCart() {
  try {
    const cart = await getOrCreateCart()

    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    revalidatePath('/cart')
    return { success: true }
  } catch (error) {
    console.error('Clear cart error:', error)
    return { success: false, error: 'Failed to clear cart' }
  }
}
