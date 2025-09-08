'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  LogOut,
  ShoppingBag,
  UserPlus,
  LogIn,
  Heart,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

export function UserNav() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: '/' })
    setIsLoading(false)
  }

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/customer-signin">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
          <Link href="/auth/signup">
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Link>
        </Button>
      </div>
    )
  }

  const userInitials = session.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-amber-100 text-amber-800 font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Account Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/profile" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/addresses" className="cursor-pointer">
            <MapPin className="mr-2 h-4 w-4" />
            <span>Addresses</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>My Wishlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/support" className="cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/cart" className="cursor-pointer">
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Shopping Cart</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
