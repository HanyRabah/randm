'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Loader2, 
  MapPin, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Home,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'

interface Address {
  id: string
  firstName: string
  lastName: string
  company?: string
  line1: string
  line2?: string
  city: string
  state: string
  buildingNumber?: string
  floorNumber?: string
  apartmentNumber?: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt: string
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    buildingNumber: '',
    floorNumber: '',
    apartmentNumber: '',
    country: 'EG',
    phone: '',
    isDefault: false
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/customer-signin?callbackUrl=/account/addresses')
      return
    }

    if (status === 'authenticated') {
      fetchAddresses()
    }
  }, [status, router])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      buildingNumber: '',
      floorNumber: '',
      apartmentNumber: '',
      country: 'EG',
      phone: '',
      isDefault: false
    })
    setEditingAddress(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses'
      
      const method = editingAddress ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save address')
      }

      await fetchAddresses()
      setIsDialogOpen(false)
      resetForm()
      
      toast({
        title: editingAddress ? 'Address Updated' : 'Address Added',
        description: `Your address has been successfully ${editingAddress ? 'updated' : 'added'}.`,
      })
    } catch (error: any) {
      console.error('Address save error:', error)
      setError(error.message || 'Failed to save address. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      buildingNumber: address.buildingNumber || '',
      floorNumber: address.floorNumber || '',
      apartmentNumber: address.apartmentNumber || '',
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      await fetchAddresses()
      toast({
        title: 'Address Deleted',
        description: 'The address has been successfully removed.',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete address. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/set-default`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to set default address')
      }

      await fetchAddresses()
      toast({
        title: 'Default Address Updated',
        description: 'This address is now your default shipping address.',
      })
    } catch (error) {
      console.error('Set default error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update default address. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getAddressIcon = () => {
    return <MapPin className="h-4 w-4" />
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link href="/account">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Account
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Manage Addresses</h1>
                <p className="text-gray-300">Add and manage your delivery addresses</p>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={resetForm}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAddress 
                      ? 'Update your address information'
                      : 'Add a new delivery address to your account'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First name"
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last name"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Company name"
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="line1">Address Line 1</Label>
                    <Input
                      id="line1"
                      value={formData.line1}
                      onChange={(e) => handleInputChange('line1', e.target.value)}
                      placeholder="Street address"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                    <Input
                      id="line2"
                      value={formData.line2}
                      onChange={(e) => handleInputChange('line2', e.target.value)}
                      placeholder="Apartment, suite, etc."
                      disabled={saving}
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="buildingNumber">Building Number</Label>
                      <Input
                        id="buildingNumber"
                        value={formData.buildingNumber}
                        onChange={(e) => handleInputChange('buildingNumber', e.target.value)}
                        placeholder="Building #"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floorNumber">Floor Number</Label>
                      <Input
                        id="floorNumber"
                        value={formData.floorNumber}
                        onChange={(e) => handleInputChange('floorNumber', e.target.value)}
                        placeholder="Floor #"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartmentNumber">Apartment Number</Label>
                      <Input
                        id="apartmentNumber"
                        value={formData.apartmentNumber}
                        onChange={(e) => handleInputChange('apartmentNumber', e.target.value)}
                        placeholder="Apt #"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        required
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Governorate</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State/Governorate"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={saving}
                        required
                      >
                        <option value="EG">Egypt</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Phone number"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      disabled={saving}
                    />
                    <Label htmlFor="isDefault" className="text-sm">
                      Set as default address
                    </Label>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingAddress ? 'Update' : 'Add'} Address
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <Card key={address.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAddressIcon()}
                      <CardTitle className="text-lg">{address.firstName} {address.lastName}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    {address.company && (
                      <p className="font-medium text-gray-700">{address.company}</p>
                    )}
                    <p className="font-medium">{address.line1}</p>
                    {address.line2 && (
                      <p className="text-gray-600">{address.line2}</p>
                    )}
                    <div className="flex gap-2 text-gray-600">
                      {address.buildingNumber && <span>Bldg {address.buildingNumber}</span>}
                      {address.floorNumber && <span>Floor {address.floorNumber}</span>}
                      {address.apartmentNumber && <span>Apt {address.apartmentNumber}</span>}
                    </div>
                    <p className="text-gray-600">{address.city}, {address.state}</p>
                    <p className="text-gray-600">{address.country}</p>
                    {address.phone && (
                      <p className="text-gray-600">{address.phone}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(address)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first delivery address to get started
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Address
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
