'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { getOrdersForAdmin } from '@/server/queries/orders'
import { updateOrderStatus, markCodCollected, cancelOrder, exportOrdersForCourier } from '@/server/actions/orders'
import { Eye, Edit, Trash2, Download, CheckCircle } from 'lucide-react'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-100 text-gray-800',
}

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELED'

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELED', label: 'Canceled' },
]

export function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getOrdersForAdmin({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        page,
        limit: 20,
      })
      setOrders(result.orders)
      setPagination(result.pagination)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery, page, toast])

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, searchQuery, page, fetchOrders])

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus)
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: 'Order status has been updated successfully',
        })
        fetchOrders()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    }
  }

  const handleCodCollected = async (orderId: string) => {
    try {
      const result = await markCodCollected(orderId)
      if (result.success) {
        toast({
          title: 'COD Collected',
          description: 'Order marked as COD collected and delivered',
        })
        fetchOrders()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to mark COD collected',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark COD collected',
        variant: 'destructive',
      })
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        toast({
          title: 'Order Canceled',
          description: 'Order has been canceled and inventory restored',
        })
        fetchOrders()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to cancel order',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      })
    }
  }

  const handleExportSelected = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: 'No Orders Selected',
        description: 'Please select orders to export',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await exportOrdersForCourier(selectedOrders)
      if (result.success) {
        // Create and download CSV file
        const blob = new Blob([result.csvContent || ''], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || 'orders-export.csv'
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: 'Export Successful',
          description: `${selectedOrders.length} orders exported for courier`,
        })
        setSelectedOrders([])
        fetchOrders()
      } else {
        toast({
          title: 'Export Failed',
          description: result.error || 'Failed to export orders',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export orders',
        variant: 'destructive',
      })
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value as OrderStatus)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedOrders.length > 0 && (
          <Button onClick={handleExportSelected} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Selected ({selectedOrders.length})
          </Button>
        )}
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(orders.map(order => order.id))
                    } else {
                      setSelectedOrders([])
                    }
                  }}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrderSelection(order.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    {!order.otpVerified && (
                      <Badge variant="outline" className="text-xs">
                        OTP Pending
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">${order.total.toFixed(2)}</div>
                  {order.status === 'DELIVERED' && (
                    <Badge 
                      variant="outline" 
                      className={order.codCollected ? 'text-green-600' : 'text-yellow-600'}
                    >
                      COD {order.codCollected ? 'Collected' : 'Pending'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status as OrderStatus]}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.createdAt.toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/track/${order.orderNumber}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Select
                      value={order.status || "PENDING"}
                      onValueChange={(value) => handleStatusUpdate(order.id, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {order.status === 'DELIVERED' && !order.codCollected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCodCollected(order.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}

                    {order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
