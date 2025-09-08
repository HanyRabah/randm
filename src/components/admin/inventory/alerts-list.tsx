'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { AlertTriangle, Edit, Trash2, Search, Plus, RefreshCw } from 'lucide-react'
import { AlertForm } from './alert-form'

interface InventoryAlert {
  id: string
  threshold: number
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK'
  isActive: boolean
  lastAlertSent: string | null
  createdAt: string
  currentStock: number
  isTriggered: boolean
  product?: {
    id: string
    name: string
    slug: string
  }
  variant?: {
    id: string
    sku: string
    inventory: number
    product: {
      name: string
      slug: string
    }
  }
}

export function AlertsList() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<InventoryAlert | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    alertType: '',
    page: 1
  })

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20'
      })
      
      if (filters.search) params.append('search', filters.search)
      if (filters.isActive) params.append('isActive', filters.isActive)
      if (filters.alertType) params.append('alertType', filters.alertType)

      const response = await fetch(`/api/admin/inventory/alerts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch alerts',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [filters])

  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const response = await fetch(`/api/admin/inventory/alerts/${alertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Alert deleted successfully'
        })
        fetchAlerts()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete alert',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleCheckAlerts = async () => {
    try {
      const response = await fetch('/api/admin/inventory/check', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Alerts Checked',
          description: data.message
        })
        fetchAlerts() // Refresh the list
      } else {
        toast({
          title: 'Error',
          description: 'Failed to check alerts',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  const getAlertBadge = (alert: InventoryAlert) => {
    if (!alert.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (alert.isTriggered) {
      return <Badge variant="destructive">Triggered</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getStockStatus = (alert: InventoryAlert) => {
    if (alert.alertType === 'OUT_OF_STOCK' && alert.currentStock === 0) {
      return <span className="text-red-600 font-medium">Out of Stock</span>
    }
    if (alert.currentStock <= alert.threshold) {
      return <span className="text-orange-600 font-medium">Low Stock ({alert.currentStock})</span>
    }
    return <span className="text-green-600 font-medium">In Stock ({alert.currentStock})</span>
  }

  if (showForm) {
    return (
      <div className="flex justify-center">
        <AlertForm
          onSuccess={() => {
            setShowForm(false)
            fetchAlerts()
          }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    )
  }

  if (editingAlert) {
    return (
      <div className="flex justify-center">
        <AlertForm
          initialData={{
            id: editingAlert.id,
            productId: editingAlert.product?.id,
            variantId: editingAlert.variant?.id,
            threshold: editingAlert.threshold,
            alertType: editingAlert.alertType,
            isActive: editingAlert.isActive
          }}
          onSuccess={() => {
            setEditingAlert(null)
            fetchAlerts()
          }}
          onCancel={() => setEditingAlert(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Alerts</h1>
        <div className="flex space-x-2">
          <Button onClick={handleCheckAlerts} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Alerts
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.isActive}
              onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.alertType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, alertType: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ search: '', isActive: '', alertType: '', page: 1 })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500 mb-4">Create your first inventory alert to get started.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={alert.isTriggered ? 'border-red-200 bg-red-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">
                        {alert.variant 
                          ? `${alert.variant.product.name} - ${alert.variant.sku}`
                          : alert.product?.name
                        }
                      </h3>
                      {getAlertBadge(alert)}
                      {alert.isTriggered && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span> {alert.alertType.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Threshold:</span> {alert.threshold}
                      </div>
                      <div>
                        <span className="font-medium">Current Stock:</span> {getStockStatus(alert)}
                      </div>
                      <div>
                        <span className="font-medium">Last Alert:</span>{' '}
                        {alert.lastAlertSent 
                          ? new Date(alert.lastAlertSent).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAlert(alert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
