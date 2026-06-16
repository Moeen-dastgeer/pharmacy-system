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
  Bell,
  Printer,
  FileText,
  BarChart3,
  Settings,
  Receipt,
  ClipboardList,
  UserCog,
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  MoreVertical,
  Eye,
  Barcode,
  PrinterIcon,
  Wallet,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// ===== DATA TYPES =====
interface Medicine {
  id: string
  name: string
  genericName: string | null
  description: string | null
  price: number
  stock: number
  minStock: number
  expiryDate: string | null
  batchNumber: string | null
  category: {
    id: string
    name: string
  } | null
  supplier: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
  description: string | null
  _count?: {
    medicines: number
  }
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  _count?: {
    sales: number
  }
}

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  _count?: {
    medicines: number
    purchases: number
  }
}

interface SaleItem {
  medicineId: string
  quantity: number
  price: number
}

interface Sale {
  id: string
  invoiceNumber: string
  customer: Customer | null
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  status: string
  items: {
    id: string
    medicine: {
      name: string
    }
    quantity: number
    unitPrice: number
    total: number
  }[]
  createdAt: string
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplier: Supplier | null
  subtotal: number
  discount: number
  tax: number
  total: number
  status: string
  receivedDate: string | null
  createdAt: string
}

interface Prescription {
  id: string
  patientName: string
  doctorName: string | null
  notes: string | null
  status: string
  createdAt: string
}

interface Staff {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
}

// ===== MAIN COMPONENT =====
export default function PharmacyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('today')

  // Data States
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [staff, setStaff] = useState<Staff[]>([])

  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    todaySales: 0,
    totalSales: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingPrescriptions: 0,
    totalPrescriptions: 0,
    pendingOrders: 0,
    activeStaff: 0
  })

  // Dialog States
  const [medicineDialog, setMedicineDialog] = useState(false)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [customerDialog, setCustomerDialog] = useState(false)
  const [supplierDialog, setSupplierDialog] = useState(false)
  const [saleDialog, setSaleDialog] = useState(false)
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [prescriptionDialog, setPrescriptionDialog] = useState(false)
  const [staffDialog, setStaffDialog] = useState(false)
  const [settingsDialog, setSettingsDialog] = useState(false)

  // Form States
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    categoryId: '',
    price: '',
    stock: '',
    minStock: '10',
    batchNumber: '',
    expiryDate: '',
    supplierId: '',
    barcode: '',
    manufacturer: '',
    description: ''
  })

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [supplierForm, setSupplierForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', role: 'staff', password: '' })
  const [prescriptionForm, setPrescriptionForm] = useState({ patientName: '', doctorName: '', notes: '' })
  const [purchaseForm, setPurchaseForm] = useState({ supplierId: '', discount: '0', tax: '0', notes: '' })

  // Sales State
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [saleDiscount, setSaleDiscount] = useState(0)

  // Settings State
  const [settings, setSettings] = useState({
    pharmacyName: 'My Pharmacy',
    address: '',
    phone: '',
    email: '',
    taxRate: '0',
    currency: 'PKR'
  })

  // ===== LOAD DATA =====
  const refreshData = async () => {
    try {
      const [dashboardRes, medicinesRes, categoriesRes, customersRes, suppliersRes, salesRes] = await Promise.all([
        fetch('/api/pharmacy/dashboard'),
        fetch('/api/pharmacy/medicines'),
        fetch('/api/pharmacy/categories'),
        fetch('/api/pharmacy/customers'),
        fetch('/api/pharmacy/suppliers'),
        fetch('/api/pharmacy/sales')
      ])

      const [dashboardData, medicinesData, categoriesData, customersData, suppliersData, salesData] = await Promise.all([
        dashboardRes.json(),
        medicinesRes.json(),
        categoriesRes.json(),
        customersRes.json(),
        suppliersRes.json(),
        salesRes.json()
      ])

      setStats(dashboardData)
      setMedicines(medicinesData)
      setCategories(categoriesData)
      setCustomers(customersData)
      setSuppliers(suppliersData)
      setSales(salesData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardRes, medicinesRes, categoriesRes, customersRes, suppliersRes, salesRes] = await Promise.all([
          fetch('/api/pharmacy/dashboard'),
          fetch('/api/pharmacy/medicines'),
          fetch('/api/pharmacy/categories'),
          fetch('/api/pharmacy/customers'),
          fetch('/api/pharmacy/suppliers'),
          fetch('/api/pharmacy/sales')
        ])

        const [dashboardData, medicinesData, categoriesData, customersData, suppliersData, salesData] = await Promise.all([
          dashboardRes.json(),
          medicinesRes.json(),
          categoriesRes.json(),
          customersRes.json(),
          suppliersRes.json(),
          salesRes.json()
        ])

        setTimeout(() => {
          setStats(dashboardData)
          setMedicines(medicinesData)
          setCategories(categoriesData)
          setCustomers(customersData)
          setSuppliers(suppliersData)
          setSales(salesData)
        }, 0)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  // ===== SAVE FUNCTIONS =====
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
          supplierId: medicineForm.supplierId || null,
          barcode: medicineForm.barcode || null,
          manufacturer: medicineForm.manufacturer || null,
          description: medicineForm.description || null
        })
      })

      if (response.ok) {
        toast({ title: 'Success', description: 'Medicine saved successfully' })
        setMedicineDialog(false)
        resetMedicineForm()
        refreshData()
      }
    } catch (error) {
      console.error('Error saving medicine:', error)
    }
  }

  const handleSaveCategory = async () => {
    try {
      const response = await fetch('/api/pharmacy/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        toast({ title: 'Success', description: 'Category saved successfully' })
        setCategoryDialog(false)
        setCategoryForm({ name: '', description: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleSaveCustomer = async () => {
    try {
      const response = await fetch('/api/pharmacy/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      })

      if (response.ok) {
        toast({ title: 'Success', description: 'Customer saved successfully' })
        setCustomerDialog(false)
        setCustomerForm({ name: '', email: '', phone: '', address: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const handleSaveSupplier = async () => {
    try {
      const response = await fetch('/api/pharmacy/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      if (response.ok) {
        toast({ title: 'Success', description: 'Supplier saved successfully' })
        setSupplierDialog(false)
        setSupplierForm({ name: '', email: '', phone: '', address: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  const handleCompleteSale = async () => {
    if (saleItems.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one item' })
      return
    }

    try {
      const response = await fetch('/api/pharmacy/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer || "none",
          items: saleItems,
          discount: saleDiscount,
          paymentMethod
        })
      })

      if (response.ok) {
        toast({ title: 'Success', description: 'Sale completed successfully' })
        setSaleDialog(false)
        setSaleItems([])
        setSelectedCustomer('')
        setSaleDiscount(0)
        refreshData()
      }
    } catch (error) {
      console.error('Error completing sale:', error)
    }
  }

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return

    try {
      const response = await fetch(`/api/pharmacy/medicines?id=${id}`, { method: 'DELETE' })

      if (response.ok) {
        toast({ title: 'Success', description: 'Medicine deleted successfully' })
        refreshData()
      }
    } catch (error) {
      console.error('Error deleting medicine:', error)
    }
  }

  const handleSaveStaff = async () => {
    try {
      const response = await fetch('/api/pharmacy/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      })

      if (response.ok) {
        toast({ title: 'Success', description: 'Staff member added successfully' })
        setStaffDialog(false)
        setStaffForm({ name: '', email: '', phone: '', role: 'staff', password: '' })
        refreshData()
      }
    } catch (error) {
      console.error('Error saving staff:', error)
    }
  }

  // ===== RESET FORM =====
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
      supplierId: '',
      barcode: '',
      manufacturer: '',
      description: ''
    })
  }

  // ===== SALES ITEMS =====
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

  const removeSaleItem = (medicineId: string) => {
    setSaleItems(saleItems.filter(item => item.medicineId !== medicineId))
  }

  const saleTotal = saleItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const grandTotal = saleTotal - saleDiscount

  // ===== FILTERED DATA =====
  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ===== ALERTS =====
  const expiringMedicines = medicines.filter(med => {
    if (!med.expiryDate) return false
    const expiryDate = new Date(med.expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30
  })

  const lowStockMedicines = medicines.filter(med => med.stock <= med.minStock)

  // ===== MENU ITEMS =====
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'medicines', icon: Pill, label: 'Medicines' },
    { id: 'categories', icon: Package, label: 'Categories' },
    { id: 'sales', icon: ShoppingCart, label: 'Sales' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'suppliers', icon: Building2, label: 'Suppliers' },
    { id: 'prescriptions', icon: FileText, label: 'Prescriptions' },
    { id: 'staff', icon: UserCog, label: 'Staff' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Pharmacy Pro
              </h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <ul className="space-y-2">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-sm font-semibold text-white">AD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-gray-500">Pharmacist</p>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-lg border-b">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search medicines, customers..."
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
              <Button variant="outline" size="icon" onClick={() => refreshData()}>
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Dashboard</h2>
                  <p className="text-gray-500">Overview of your pharmacy</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('sales')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    New Sale
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Reports
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Medicines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-emerald-600">{stats.totalMedicines}</div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                        <Pill className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Low Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-orange-600">{stats.lowStock}</div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <Package className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Expiring Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-red-600">{stats.expiringSoon}</div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-blue-600">
                        ${stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts Section */}
              <div className="grid gap-6 md:grid-cols-2">
                {lowStockMedicines.length > 0 && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Low Stock Alerts
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
                            <Badge variant="destructive">{med.stock} units</Badge>
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
                        Expiring Medicines
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
                              {Math.ceil((new Date(med.expiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Sales */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>Latest transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {sales.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.slice(0, 5).map(sale => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                            <TableCell>{sale.customer?.name || 'Walk-in'}</TableCell>
                            <TableCell>${sale.total.toFixed(2)}</TableCell>
                            <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No sales yet</p>
                      <Button onClick={() => setSaleDialog(true)} className="mt-4 bg-gradient-to-r from-emerald-500 to-blue-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Start New Sale
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Medicines</h2>
                  <p className="text-gray-500">Manage your medicine inventory</p>
                </div>
                <Button onClick={() => setMedicineDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Generic Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <Badge variant={med.stock <= med.minStock ? 'destructive' : 'default'}>
                            {med.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>${med.price.toFixed(2)}</TableCell>
                        <TableCell>{med.expiryDate?.split('T')[0] || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMedicine(med.id)}>
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
                  <h2 className="text-2xl font-bold">Categories</h2>
                  <p className="text-gray-500">Organize medicines by category</p>
                </div>
                <Button onClick={() => setCategoryDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(cat => (
                  <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{cat.name}</CardTitle>
                      <CardDescription>{cat._count?.medicines || 0} medicines</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Sales</h2>
                  <p className="text-gray-500">All sales transactions</p>
                </div>
                <Button onClick={() => setSaleDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  New Sale
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map(sale => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                        <TableCell>{sale.customer?.name || 'Walk-in'}</TableCell>
                        <TableCell>${sale.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Customers</h2>
                  <p className="text-gray-500">Manage customer information</p>
                </div>
                <Button onClick={() => setCustomerDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(cust => (
                      <TableRow key={cust.id}>
                        <TableCell className="font-medium">{cust.name}</TableCell>
                        <TableCell>{cust.email || '-'}</TableCell>
                        <TableCell>{cust.phone || '-'}</TableCell>
                        <TableCell>{cust._count?.sales || 0}</TableCell>
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
                  <h2 className="text-2xl font-bold">Suppliers</h2>
                  <p className="text-gray-500">Manage supplier information</p>
                </div>
                <Button onClick={() => setSupplierDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Medicines</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map(sup => (
                      <TableRow key={sup.id}>
                        <TableCell className="font-medium">{sup.name}</TableCell>
                        <TableCell>{sup.email || '-'}</TableCell>
                        <TableCell>{sup.phone || '-'}</TableCell>
                        <TableCell>{sup._count?.medicines || 0}</TableCell>
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

          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Prescriptions</h2>
                  <p className="text-gray-500">Manage patient prescriptions</p>
                </div>
                <Button onClick={() => setPrescriptionDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  New Prescription
                </Button>
              </div>

              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Prescriptions will be displayed here</p>
                  <Button onClick={() => setPrescriptionDialog(true)} className="mt-4">
                    Add First Prescription
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Staff Management</h2>
                  <p className="text-gray-500">Manage pharmacy staff</p>
                </div>
                <Button onClick={() => setStaffDialog(true)} className="bg-gradient-to-r from-emerald-500 to-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </div>

              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  <UserCog className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Staff members will be displayed here</p>
                  <Button onClick={() => setStaffDialog(true)} className="mt-4">
                    Add First Staff Member
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Reports & Analytics</h2>
                <p className="text-gray-500">View detailed reports and statistics</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Sales Report
                    </CardTitle>
                    <CardDescription>Daily, weekly, monthly sales</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-500" />
                      Inventory Report
                    </CardTitle>
                    <CardDescription>Stock levels and movements</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Revenue Report
                    </CardTitle>
                    <CardDescription>Income and profit analysis</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Expiry Report
                    </CardTitle>
                    <CardDescription>Expiring medicines list</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      Customer Report
                    </CardTitle>
                    <CardDescription>Customer purchases and history</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Performance Report
                    </CardTitle>
                    <CardDescription>Overall performance metrics</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-gray-500">Configure your pharmacy settings</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pharmacy Information</CardTitle>
                  <CardDescription>Update your pharmacy details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Pharmacy Name</Label>
                    <Input value={settings.pharmacyName} onChange={(e) => setSettings({...settings, pharmacyName: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Input value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input type="email" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" value={settings.taxRate} onChange={(e) => setSettings({...settings, taxRate: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings({...settings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PKR">Pakistani Rupee (PKR)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-500 to-blue-600">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Medicine Dialog */}
      <Dialog open={medicineDialog} onOpenChange={setMedicineDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Medicine Name *</Label>
              <Input
                value={medicineForm.name}
                onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                placeholder="e.g., Panadol 500mg"
              />
            </div>
            <div className="grid gap-2">
              <Label>Generic Name</Label>
              <Input
                value={medicineForm.genericName}
                onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
                placeholder="e.g., Paracetamol"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={medicineForm.description}
                onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                placeholder="Medicine description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={medicineForm.categoryId} onValueChange={(value) => setMedicineForm({ ...medicineForm, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={medicineForm.price}
                  onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                  placeholder="Price per unit"
                />
              </div>
              <div className="grid gap-2">
                <Label>Stock *</Label>
                <Input
                  type="number"
                  value={medicineForm.stock}
                  onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
                  placeholder="Quantity"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Minimum Stock Level</Label>
              <Input
                type="number"
                value={medicineForm.minStock}
                onChange={(e) => setMedicineForm({ ...medicineForm, minStock: e.target.value })}
                placeholder="Alert threshold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Batch Number</Label>
                <Input
                  value={medicineForm.batchNumber}
                  onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
                  placeholder="e.g., BTH-2024-001"
                />
              </div>
              <div className="grid gap-2">
                <Label>Barcode</Label>
                <Input
                  value={medicineForm.barcode}
                  onChange={(e) => setMedicineForm({ ...medicineForm, barcode: e.target.value })}
                  placeholder="Barcode number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Manufacturer</Label>
              <Input
                value={medicineForm.manufacturer}
                onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                placeholder="Manufacturer name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={medicineForm.expiryDate}
                onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Select value={medicineForm.supplierId} onValueChange={(value) => setMedicineForm({ ...medicineForm, supplierId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
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
            <Button variant="outline" onClick={() => setMedicineDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMedicine} className="bg-gradient-to-r from-emerald-500 to-blue-600">Save Medicine</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Category Name *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Antibiotics"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-gradient-to-r from-emerald-500 to-blue-600">Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={customerDialog} onOpenChange={setCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                placeholder="Address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCustomer} className="bg-gradient-to-r from-emerald-500 to-blue-600">Save Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Dialog */}
      <Dialog open={supplierDialog} onOpenChange={setSupplierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Textarea
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                placeholder="Address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSupplier} className="bg-gradient-to-r from-emerald-500 to-blue-600">Save Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Dialog */}
      <Dialog open={saleDialog} onOpenChange={setSaleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Sale</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Customer (Optional)</Label>
              <Select value={selectedCustomer || "none"} onValueChange={(value) => setSelectedCustomer(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer or walk-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Walk-in Customer</SelectItem>
                  {customers.map(cust => (
                    <SelectItem key={cust.id} value={cust.id}>{cust.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Add Medicines</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {medicines.map(med => (
                  <div key={med.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-gray-500">{med.genericName} • Stock: {med.stock}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">${med.price.toFixed(2)}</span>
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
                <Label>Sale Items</Label>
                <div className="space-y-2">
                  {saleItems.map(item => {
                    const med = medicines.find(m => m.id === item.medicineId)
                    return (
                      <div key={item.medicineId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{med?.name}</p>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeSaleItem(item.medicineId)}>
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
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${saleTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Discount:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={saleDiscount}
                      onChange={(e) => setSaleDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span>${saleDiscount.toFixed(2)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSaleDialog(false)
              setSaleItems([])
              setSelectedCustomer('')
              setSaleDiscount(0)
            }}>Cancel</Button>
            <Button
              onClick={handleCompleteSale}
              disabled={saleItems.length === 0}
              className="bg-gradient-to-r from-emerald-500 to-blue-600"
            >
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={staffDialog} onOpenChange={setStaffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role *</Label>
              <Select value={staffForm.role} onValueChange={(value) => setStaffForm({ ...staffForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                placeholder="Temporary password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveStaff} className="bg-gradient-to-r from-emerald-500 to-blue-600">Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={prescriptionDialog} onOpenChange={setPrescriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Patient Name *</Label>
              <Input
                value={prescriptionForm.patientName}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patientName: e.target.value })}
                placeholder="Patient's full name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Doctor Name</Label>
              <Input
                value={prescriptionForm.doctorName}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, doctorName: e.target.value })}
                placeholder="Prescribing doctor"
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={prescriptionForm.notes}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                placeholder="Prescription notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrescriptionDialog(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-600">Save Prescription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}