import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Ticket, 
  Megaphone,
  Users,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Popups', href: '/admin/popups', icon: Megaphone },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <SidebarLink key={item.name} item={item} />
        ))}
      </nav>
    </div>
  )
}

function SidebarLink({ item }: { item: typeof navigation[0] }) {
  // Note: usePathname is a client hook, so we'll need to make this a client component
  // For now, we'll use a simple approach
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      <item.icon className="mr-3 h-5 w-5" />
      {item.name}
    </Link>
  )
}
