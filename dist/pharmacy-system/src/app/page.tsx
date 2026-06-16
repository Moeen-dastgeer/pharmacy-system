'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

// ===== ڈیٹا ٹائپس =====
interface Medicine {
  id: string
  name: string
  genericName: string | null
  price: number
  stock: number
  minStock: number
  expiryDate: string | null
  batchNumber: string | null
  category: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface SaleItem {
  medicineId: string
  quantity: number
  price: number
}

// ===== مین کمپوننٹ =====
export default function PharmacyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  // ڈیٹا اسٹیٹس
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    todaySales: 0,
    totalSales: 0,
    totalRevenue: 0
  })

  // ڈائیلاگ اسٹیٹس
  const [medicineDialog, setMedicineDialog] = useState(false)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [customerDialog, setCustomerDialog] = useState(false)
  const [supplierDialog, setSupplierDialog] = useState(false)
  const [saleDialog, setSaleDialog] = useState(false)

  // فارم اسٹیٹس
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    categoryId: '',
    price: '',
    stock: '',
    minStock: '10',
    batchNumber: '',
    expiryDate: '',
    supplierId: ''
  })

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', phone: '', address: '' })

  // سیلز اسٹیٹ
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')

  // ===== ڈیٹا ریفریش کرنا =====
  const refreshData = async () => {
    try {
      const [dashboardRes, medicinesRes, categoriesRes, customersRes, suppliersRes] = await Promise.all([
        fetch('/api/pharmacy/dashboard'),
        fetch('/api/pharmacy/medicines'),
        fetch('/api/pharmacy/categories'),
        fetch('/api/pharmacy/customers'),
        fetch('/api/pharmacy/suppliers')
      ])

      const dashboardData = await dashboardRes.json()
      const medicinesData = await medicinesRes.json()
      const categoriesData = await categoriesRes.json()
      const customersData = await customersRes.json()
      const suppliersData = await suppliersRes.json()

      setStats(dashboardData)
      setMedicines(medicinesData)
      setCategories(categoriesData)
      setCustomers(customersData)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // ===== ڈیٹا لوڈ کرنا =====
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardRes, medicinesRes, categoriesRes, customersRes, suppliersRes] = await Promise.all([
          fetch('/api/pharmacy/dashboard'),
          fetch('/api/pharmacy/medicines'),
          fetch('/api/pharmacy/categories'),
          fetch('/api/pharmacy/customers'),
          fetch('/api/pharmacy/suppliers')
        ])

        const dashboardData = await dashboardRes.json()
        const medicinesData = await medicinesRes.json()
        const categoriesData = await categoriesRes.json()
        const customersData = await customersRes.json()
        const suppliersData = await suppliersRes.json()

        // Use setTimeout to avoid setState in effect body
        setTimeout(() => {
          setStats(dashboardData)
          setMedicines(medicinesData)
          setCategories(categoriesData)
          setCustomers(customersData)
          setSuppliers(suppliersData)
        }, 0)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  // ===== میڈیسین بنانا =====
  const handleSaveMedicine = async () => {
    try {
      const response = await fetch('/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: medicineForm.name,
          genericName: medicineForm.genericName,
          categoryId: medicineForm.categoryId || null,
          price: parseFloat(medicineForm.price),
          stock: parseInt(medicineForm.stock),
          minStock: parseInt(medicineForm.minStock),
          batchNumber: medicineForm.batchNumber,
          expiryDate: medicineForm.expiryDate ? new Date(medicineForm.expiryDate).toISOString() : null,
          supplierId: medicineForm.supplierId || null
        })
      })

      if (response.ok) {
        toast({ title: 'کامیابی', description: 'دوا محفوظ ہو گئی ہے' })
        setMedicineDialog(false)
        resetMedicineForm()
        refreshData()
      }
    } catch (error) {
      console.error('Error saving medicine:', error)
    }
  }

  // ===== میڈیسین ڈیلیٹ کرنا =====
  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('کیا آپ واقعی یہ دوا حذف کرنا چاہتے ہیں؟')) return

    try {
      const response = await fetch(`/api/pharmacy/medicines?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: 'کامیابی', description: 'دوا حذف ہو گئی ہے' })
        refreshData()
      }
    } catch (error) {
      console.error('Error deleting medicine:', error)
    }
  }

  // ===== کیٹیگری بنانا =====
  const handleSaveCategory = async () => {
    try {
      const response = await fetch('/api/pharmacy/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        toast({ title: 'کامیابی', description: 'کیٹیگری محفوظ ہو گئی ہے' })
        setCategoryDialog(false)
        setCategoryForm({ name: '', description: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  // ===== کسٹمر بنانا =====
  const handleSaveCustomer = async () => {
    try {
      const response = await fetch('/api/pharmacy/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      })

      if (response.ok) {
        toast({ title: 'کامیابی', description: 'کسٹمر محفوظ ہو گیا ہے' })
        setCustomerDialog(false)
        setCustomerForm({ name: '', email: '', phone: '', address: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  // ===== سپلائر بنانا =====
  const handleSaveSupplier = async () => {
    try {
      const response = await fetch('/api/pharmacy/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      if (response.ok) {
        toast({ title: 'کامیابی', description: 'سپلائر محفوظ ہو گیا ہے' })
        setSupplierDialog(false)
        setSupplierForm({ name: '', email: '', phone: '', address: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  // ===== فارم ریسٹ =====
  const resetMedicineForm = () => {
    setMedicineForm({
      name: '',
      genericName: '',
      categoryId: '',
      price: '',
      stock: '',
      minStock: '10',
      batchNumber: '',
      expiryDate: '',
      supplierId: ''
    })
  }

  // ===== سیلز میں آئٹم شامل کرنا =====
  const addSaleItem = (medicine: Medicine) => {
    const existingItem = saleItems.find(item => item.medicineId === medicine.id)

    if (existingItem) {
      setSaleItems(saleItems.map(item =>
        item.medicineId === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setSaleItems([...saleItems, {
        medicineId: medicine.id,
        quantity: 1,
        price: medicine.price
      }])
    }
  }

  // ===== سیلز میں آئٹم ہٹانا =====
  const removeSaleItem = (medicineId: string) => {
    setSaleItems(saleItems.filter(item => item.medicineId !== medicineId))
  }

  // ===== سیل کمپلیٹ کرنا =====
  const handleCompleteSale = async () => {
    if (saleItems.length === 0) {
      toast({ title: 'نقص', description: 'کم از کم ایک آئٹم منتخب کریں' })
      return
    }

    try {
      const response = await fetch('/api/pharmacy/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer || null,
          items: saleItems
        })
      })

      if (response.ok) {
        toast({ title: 'کامیابی', description: 'سیل مکمل ہو گئی ہے' })
        setSaleDialog(false)
        setSaleItems([])
        setSelectedCustomer('')
        refreshData()
      }
    } catch (error) {
      console.error('Error completing sale:', error)
    }
  }

  // ===== سیل ٹوٹل =====
  const saleTotal = saleItems.reduce((total, item) => total + (item.price * item.quantity), 0)

  // ===== فلٹر کردہ میڈیسنز =====
  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ===== ایکسپائر الرٹس =====
  const expiringMedicines = medicines.filter(med => {
    if (!med.expiryDate) return false
    const expiryDate = new Date(med.expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  })

  const lowStockMedicines = medicines.filter(med => med.stock <= med.minStock)

  // ===== سائیڈ بار مینو =====
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'ڈیش بورڈ' },
    { id: 'medicines', icon: Pill, label: 'ادویات' },
    { id: 'categories', icon: Package, label: 'کیٹیگریز' },
    { id: 'sales', icon: ShoppingCart, label: 'سیلز' },
    { id: 'customers', icon: Users, label: 'کسٹمرز' },
    { id: 'suppliers', icon: Package, label: 'سپلائرز' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* سائیڈ بار */}
      <aside className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                فارمیسی پلس
              </h1>
              <p className="text-xs text-gray-500">منجنمنٹ سسٹم</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-sm font-semibold text-white">AD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">ایڈمن</p>
              <p className="text-xs text-gray-500">فارمسیسٹ</p>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* مین کانٹینٹ */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* ہیڈر */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-lg border-b">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {lowStockMedicines.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                    {lowStockMedicines.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* کانٹینٹ ایریا */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">ڈیش بورڈ</h2>
                  <p className="text-gray-500">آپ کی فارمیسی کا خلاصہ</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    رپورٹ ڈاؤن لوڈ
                  </Button>
                </div>
              </div>

              {/* اسٹیٹسٹکس کارڈز */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">
                  کل ادویات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalMedicines}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Pill className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">
                  کم اسٹاک
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.lowStock}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <Package className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">
                  ایکسپائر ہونے والی
                </CardTitle>
              </CardHeader>
                  <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.expiringSoon}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">
                  کل رونیو
                </CardTitle>
                  </CardHeader>
                  <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-blue-600">
                    Rs. {stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                  </CardContent>
                </Card>
              </div>

              {/* الرٹس سیکشن */}
              <div className="grid gap-6 md:grid-cols-2">
                {lowStockMedicines.length > 0 && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        کم اسٹاک الرٹس
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {lowStockMedicines.slice(0, 5).map(med => (
                          <div key={med.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <div>
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-gray-500">{med.genericName}</p>
                            </div>
                            <Badge variant="destructive">{med.stock} بندے</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {expiringMedicines.length > 0 && (
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        ایکسپائر ہونے والی ادویات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {expiringMedicines.slice(0, 5).map(med => (
                          <div key={med.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-gray-500">{med.expiryDate?.split('T')[0]}</p>
                            </div>
                            <Badge variant="destructive">
                              {Math.ceil((new Date(med.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} دن
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* حالیہ سیلز */}
              <Card>
                <CardHeader>
                  <CardTitle>حالیہ سیلز</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>فی الحال کوئی سیل نہیں</p>
                    <Button
                      onClick={() => setSaleDialog(true)}
                      className="mt-4 bg-gradient-to-r from-green-500 to-blue-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      نئی سیل شروع کریں
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">ادویات</h2>
                  <p className="text-gray-500">تمام ادویات کا انتظام</p>
                </div>
                <Button
                  onClick={() => setMedicineDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  نئی دوا شامل کریں
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>جنرک نام</TableHead>
                      <TableHead>کیٹیگری</TableHead>
                      <TableHead>قیمت</TableHead>
                      <TableHead>اسٹاک</TableHead>
                      <TableHead>ایکسپائر ڈیٹ</TableHead>
                      <TableHead>ایکشنز</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedicines.map(med => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>{med.genericName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{med.category?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>Rs. {med.price}</TableCell>
                        <TableCell>
                          <Badge variant={med.stock <= med.minStock ? 'destructive' : 'default'}>
                            {med.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>{med.expiryDate?.split('T')[0] || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedicine(med.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">کیٹیگریز</h2>
                  <p className="text-gray-500">ادویات کی کیٹیگریز</p>
                </div>
                <Button
                  onClick={() => setCategoryDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  نئی کیٹیگری بنائیں
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(cat => (
                  <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{cat.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" size="icon" className="absolute top-4 right-4">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">سیلز</h2>
                  <p className="text-gray-500">سیلز اور بِلنگ</p>
                </div>
                <Button
                  onClick={() => setSaleDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  نئی سیل شروع کریں
                </Button>
              </div>

              <Card>
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">حالیہ سیلز یہاں دکھائی دیں گی</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">کسٹمرز</h2>
                  <p className="text-gray-500">تمام کسٹمرز کا انتظام</p>
                </div>
                <Button
                  onClick={() => setCustomerDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  نئے کسٹمر شامل کریں
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>ای میل</TableHead>
                      <TableHead>فون</TableHead>
                      <TableHead>ایکشنز</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(cust => (
                      <TableRow key={cust.id}>
                        <TableCell className="font-medium">{cust.name}</TableCell>
                        <TableCell>{cust.email || '-'}</TableCell>
                        <TableCell>{cust.phone || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">سپلائرز</h2>
                  <p className="text-gray-500">تمام سپلائرز کا انتظام</p>
                </div>
                <Button
                  onClick={() => setSupplierDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  نیا سپلائر شامل کریں
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>ای میل</TableHead>
                      <TableHead>فون</TableHead>
                      <TableHead>ایکشنز</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map(sup => (
                      <TableRow key={sup.id}>
                        <TableCell className="font-medium">{sup.name}</TableCell>
                        <TableCell>{sup.email || '-'}</TableCell>
                        <TableCell>{sup.phone || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* میڈیسین ڈائیلاگ */}
      <Dialog open={medicineDialog} onOpenChange={setMedicineDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>نئی دوا شامل کریں</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>دوا کا نام *</Label>
              <Input
                value={medicineForm.name}
                onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                placeholder="مثال: پاراسٹیمول"
              />
            </div>

            <div className="grid gap-2">
              <Label>جنرک نام</Label>
              <Input
                value={medicineForm.genericName}
                onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
                placeholder="مثال: Acetaminophen"
              />
            </div>

            <div className="grid gap-2">
              <Label>کیٹیگری</Label>
              <Select
                value={medicineForm.categoryId}
                onValueChange={(value) => setMedicineForm({ ...medicineForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="کیٹیگری منتخب کریں" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>قیمت *</Label>
                <Input
                  type="number"
                  value={medicineForm.price}
                  onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                  placeholder="Rs."
                />
              </div>

              <div className="grid gap-2">
                <Label>اسٹاک *</Label>
                <Input
                  type="number"
                  value={medicineForm.stock}
                  onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
                  placeholder="تعداد"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>کم از کم اسٹاک</Label>
              <Input
                type="number"
                value={medicineForm.minStock}
                onChange={(e) => setMedicineForm({ ...medicineForm, minStock: e.target.value })}
                placeholder="الرٹ کے لیے حد"
              />
            </div>

            <div className="grid gap-2">
              <Label>بیچ نمبر</Label>
              <Input
                value={medicineForm.batchNumber}
                onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
                placeholder="مثال: BTH-2024-001"
              />
            </div>

            <div className="grid gap-2">
              <Label>ایکسپائر ڈیٹ</Label>
              <Input
                type="date"
                value={medicineForm.expiryDate}
                onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>سپلائر</Label>
              <Select
                value={medicineForm.supplierId}
                onValueChange={(value) => setMedicineForm({ ...medicineForm, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="سپلائر منتخب کریں" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(sup => (
                    <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicineDialog(false)}>
              منسوخ
            </Button>
            <Button onClick={handleSaveMedicine} className="bg-gradient-to-r from-green-500 to-blue-600">
              محفوظ کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* کیٹیگری ڈائیلاگ */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نئی کیٹیگری بنائیں</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>کیٹیگری کا نام *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="مثال: اینٹی بائیوٹکس"
              />
            </div>
            <div className="grid gap-2">
              <Label>تفصیل</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="کیٹیگری کی تفصیل"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>
              منسوخ
            </Button>
            <Button onClick={handleSaveCategory} className="bg-gradient-to-r from-green-500 to-blue-600">
              محفوظ کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* کسٹمر ڈائیلاگ */}
      <Dialog open={customerDialog} onOpenChange={setCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نیا کسٹمر شامل کریں</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>نام *</Label>
              <Input
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                placeholder="کسٹمر کا نام"
              />
            </div>
            <div className="grid gap-2">
              <Label>ای میل</Label>
              <Input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                placeholder="ای میل ایڈریس"
              />
            </div>
            <div className="grid gap-2">
              <Label>فون</Label>
              <Input
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="فون نمبر"
              />
            </div>
            <div className="grid gap-2">
              <Label>پتہ</Label>
              <Textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                placeholder="پتہ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialog(false)}>
              منسوخ
            </Button>
            <Button onClick={handleSaveCustomer} className="bg-gradient-to-r from-green-500 to-blue-600">
              محفوظ کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* سپلائر ڈائیلاگ */}
      <Dialog open={supplierDialog} onOpenChange={setSupplierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>نیا سپلائر شامل کریں</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>نام *</Label>
              <Input
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                placeholder="سپلائر کا نام"
              />
            </div>
            <div className="grid gap-2">
              <Label>ای میل</Label>
              <Input
                type="email"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                placeholder="ای میل ایڈریس"
              />
            </div>
            <div className="grid gap-2">
              <Label>فون</Label>
              <Input
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                placeholder="فون نمبر"
              />
            </div>
            <div className="grid gap-2">
              <Label>پتہ</Label>
              <Textarea
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                placeholder="پتہ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialog(false)}>
              منسوخ
            </Button>
            <Button onClick={handleSaveSupplier} className="bg-gradient-to-r from-green-500 to-blue-600">
              محفوظ کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* سیل ڈائیلاگ */}
      <Dialog open={saleDialog} onOpenChange={setSaleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>نیا سیل</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>کسٹمر (اختیاری)</Label>
              <Select value={selectedCustomer || "none"} onValueChange={(value) => setSelectedCustomer(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="کسٹمر منتخب کریں یا واک ان کریں" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">کوئی نہیں (واک ان)</SelectItem>
                  {customers.map(cust => (
                    <SelectItem key={cust.id} value={cust.id}>{cust.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>ادویات شامل کریں</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {medicines.map(med => (
                  <div key={med.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-500">{med.genericName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Rs. {med.price}</span>
                      <Button
                        size="sm"
                        onClick={() => addSaleItem(med)}
                        disabled={med.stock === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {saleItems.length > 0 && (
              <div className="space-y-2">
                <Label>سیل آئٹمز</Label>
                <div className="space-y-2">
                  {saleItems.map(item => {
                    const med = medicines.find(m => m.id === item.medicineId)
                    return (
                      <div key={item.medicineId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{med?.name}</p>
                          <p className="text-sm text-gray-500">Rs. {item.price} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSaleItem(item.medicineId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {saleItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>کل:</span>
                  <span>Rs. {saleTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaleDialog(false)}>
              منسوخ
            </Button>
            <Button
              onClick={handleCompleteSale}
              disabled={saleItems.length === 0}
              className="bg-gradient-to-r from-green-500 to-blue-600"
            >
              سیل مکمل کریں
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}