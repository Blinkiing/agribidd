import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getSellerProfile, formatZAR } from "@/lib/data";
import {
  Package, DollarSign, ShoppingBag, TrendingUp, Plus, Upload, Users, BarChart3, ClipboardList,
  MapPin, Zap, AlertCircle, X, DollarSign as FileText, Briefcase, Trash2, UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Service Areas Configuration ──────────────────────────────────
const serviceAreas = [
  { id: "gauteng", name: "Gauteng", selected: true },
  { id: "kzn", name: "KwaZulu-Natal", selected: false },
  { id: "western-cape", name: "Western Cape", selected: true },
  { id: "limpopo", name: "Limpopo", selected: false },
  { id: "mpumalanga", name: "Mpumalanga", selected: true },
  { id: "free-state", name: "Free State", selected: false },
  { id: "eastern-cape", name: "Eastern Cape", selected: true },
  { id: "northern-cape", name: "Northern Cape", selected: false },
];

const statusColors: Record<string, string> = {
  pending: "bg-harvest/10 text-harvest",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-forest-light/10 text-forest-light",
};

type Tab = "overview" | "inventory" | "orders" | "specials" | "areas" | "finances" | "employees" | "loans";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, getOrdersByUser, addEmployee, removeEmployee, addTaxRecord, getSellerFinances } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSpecial, setShowAddSpecial] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState(serviceAreas);
  const [specialForm, setSpecialForm] = useState({ product: "", discount: "", expiryDays: "" });
  const [productForm, setProductForm] = useState({
    name: "", price: "", unit: "kg", moq: "1", category: "", description: "",
  });
  const [employeeForm, setEmployeeForm] = useState({ name: "", email: "", phone: "", role: "", salary: "" });
  const [taxForm, setTaxForm] = useState({ quarter: "Q1", year: new Date().getFullYear().toString(), revenue: "", expenses: "" });

  if (!currentUser || currentUser.accountType !== "seller") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Seller Access Required</h1>
          <p className="text-muted-foreground mb-6">You need a seller account to access the dashboard.</p>
          <Button variant="harvest" size="lg" onClick={() => navigate("/become-seller")}>
            Become a Seller
          </Button>
        </div>
      </div>
    );
  }

  // Get real seller data
  const sellerOrders = getOrdersByUser(currentUser.id);
  const sellerFinances = getSellerFinances(currentUser.id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (productImages.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setProductImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      toast.error("Please fill in product name and price");
      return;
    }
    toast.success("Product listed successfully!");
    setShowAddProduct(false);
    setProductForm({ name: "", price: "", unit: "kg", moq: "1", category: "", description: "" });
    setProductImages([]);
  };

  const handleAddSpecial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialForm.product || !specialForm.discount) {
      toast.error("Please fill in product and discount");
      return;
    }
    toast.success("Special offer created!");
    setShowAddSpecial(false);
    setSpecialForm({ product: "", discount: "", expiryDays: "" });
  };

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreas((prev) =>
      prev.map((area) =>
        area.id === areaId ? { ...area, selected: !area.selected } : area
      )
    );
  };

  const handleSaveAreas = () => {
    toast.success("Service areas updated!");
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email || !employeeForm.role) {
      toast.error("Please fill in all employee details");
      return;
    }
    addEmployee(currentUser.id, {
      id: `EMP-${Date.now()}`,
      name: employeeForm.name,
      email: employeeForm.email,
      phone: employeeForm.phone,
      role: employeeForm.role,
      joinDate: new Date().toISOString().split('T')[0],
      salary: employeeForm.salary ? parseFloat(employeeForm.salary) : undefined,
      status: "active"
    });
    toast.success("Employee added successfully!");
    setShowAddEmployee(false);
    setEmployeeForm({ name: "", email: "", phone: "", role: "", salary: "" });
  };

  const handleRemoveEmployee = (employeeId: string) => {
    removeEmployee(currentUser.id, employeeId);
    toast.success("Employee removed successfully!");
  };

  const handleAddTaxRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxForm.revenue || !taxForm.expenses) {
      toast.error("Please fill in revenue and expenses");
      return;
    }
    const revenue = parseFloat(taxForm.revenue);
    const expenses = parseFloat(taxForm.expenses);
    const taxableIncome = revenue - expenses;
    const taxAmount = taxableIncome * 0.28; // 28% tax rate

    addTaxRecord(currentUser.id, {
      id: `TAX-${Date.now()}`,
      quarter: taxForm.quarter as "Q1" | "Q2" | "Q3" | "Q4",
      year: parseInt(taxForm.year),
      revenue,
      expenses,
      taxableIncome,
      taxRate: 28,
      taxAmount,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    toast.success("Tax record added successfully!");
    setTaxForm({ quarter: "Q1", year: new Date().getFullYear().toString(), revenue: "", expenses: "" });
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "specials", label: "Specials", icon: Zap },
    { id: "areas", label: "Service Areas", icon: MapPin },
    { id: "finances", label: "Finances", icon: DollarSign },
    { id: "employees", label: "Employees", icon: Users },
    { id: "loans", label: "Loans", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {currentUser.businessLogo ? (
                <img src={currentUser.businessLogo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary">{currentUser.businessName?.[0] || "S"}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{currentUser.businessName || "My Business"}</h1>
              <p className="text-sm text-muted-foreground">{currentUser.businessLocation || "Location"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => navigate("/seller-profile-edit")}>
              <Upload className="h-4 w-4" /> Edit Profile
            </Button>
            <Button variant="harvest" className="gap-2" onClick={() => setShowAddProduct(true)}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: formatZAR(sellerFinances?.totalRevenue || 0), icon: DollarSign, color: "text-primary", gradient: "from-primary/20 to-primary/5" },
                { label: "Active Orders", value: sellerOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length.toString(), icon: ShoppingBag, color: "text-harvest", gradient: "from-harvest/20 to-harvest/5" },
                { label: "Net Profit", value: formatZAR(sellerFinances?.netProfit || 0), icon: TrendingUp, color: "text-forest-light", gradient: "from-forest-light/20 to-forest-light/5" },
                { label: "Completed Orders", value: sellerOrders.filter(o => o.status === "delivered").length.toString(), icon: Package, color: "text-earth", gradient: "from-earth/20 to-earth/5" },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.label} 
                  className={`bg-gradient-to-br ${stat.gradient} border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color} mb-3`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {sellerOrders.slice(-5).reverse().map((order, idx) => (
                  <motion.div 
                    key={order.id} 
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 hover:bg-secondary/30 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05, duration: 0.3 }}
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{order.productName}</p>
                      <p className="text-xs text-muted-foreground">Order {order.orderId} · {order.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground text-sm">{formatZAR(order.amount)}</span>
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                    </div>
                  </motion.div>
                ))}
                {sellerOrders.length === 0 && (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <p className="text-muted-foreground">No orders yet. Start by adding products!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Inventory Management</h2>
              <Button className="gap-2" onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {mockInventory.map((item) => (
                <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="font-bold text-foreground">{item.stock} {item.unit}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reorder Level</p>
                      <p className="font-bold text-foreground">{item.reorderLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-bold text-primary">{formatZAR(item.price)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="ml-4">Edit</Button>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Low Stock Alert</p>
                <p className="text-sm text-yellow-800">3 products are below reorder level. Reorder soon!</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {sellerOrders.length > 0 ? (
              sellerOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{order.orderId}</span>
                    <Badge className={statusColors[order.status]}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{order.productName} × {order.quantity}</p>
                  <p className="text-xs text-muted-foreground mt-1">Order Date: {order.createdAt}</p>
                  <p className="text-sm font-bold text-primary mt-2">{formatZAR(order.amount)}</p>
                </div>
              ))
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No orders yet. Start by adding products to your store!</p>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "specials" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Run Specials & Promotions</h2>
              <Button className="gap-2" onClick={() => setShowAddSpecial(true)}>
                <Zap className="h-4 w-4" /> Create Special
              </Button>
            </div>

            <div className="space-y-3">
              {mockSpecials.map((special) => (
                <div key={special.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{special.product}</p>
                    <p className="text-sm text-muted-foreground">{special.discount}% Discount</p>
                  </div>
                  <div className="text-right">
                    <Badge className={special.status === "active" ? "bg-harvest/10 text-harvest" : "bg-yellow-50 text-yellow-900"}>
                      {special.status === "expiring" ? "⏰ Expiring" : "✓ Active"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">{special.expiresIn}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline" className="text-red-600">Delete</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">💡 Promotion Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create limited-time offers to boost sales volume</li>
                <li>• Run 10-15% discounts during off-peak hours</li>
                <li>• Bundle products for increased average order value</li>
                <li>• Use seasonal promotions to clear excess inventory</li>
              </ul>
            </div>
          </div>
        )}

        {/* Service Areas Tab */}
        {activeTab === "areas" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Select Service Delivery Areas</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose which provinces you want to deliver to. Your products will only be visible to buyers in these areas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleAreaToggle(area.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    area.selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      area.selected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {area.selected && <span className="text-white text-sm">✓</span>}
                    </div>
                    <span className={area.selected ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {area.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="gap-2" onClick={handleSaveAreas}>
                Save Changes
              </Button>
              <Button variant="outline">
                Reset
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <p className="font-semibold text-foreground mb-3">Active in {selectedAreas.filter(a => a.selected).length} provinces</p>
              <div className="flex flex-wrap gap-2">
                {selectedAreas
                  .filter((a) => a.selected)
                  .map((area) => (
                    <Badge key={area.id} className="bg-primary/10 text-primary">
                      {area.name}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Finances Tab */}
        {activeTab === "finances" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <FileText className="h-6 w-6 text-primary mb-3" />
                <p className="text-2xl font-bold text-foreground">{formatZAR(sellerFinances?.totalRevenue || 0)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <DollarSign className="h-6 w-6 text-harvest mb-3" />
                <p className="text-2xl font-bold text-foreground">{formatZAR(sellerFinances?.totalExpenses || 0)}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <TrendingUp className="h-6 w-6 text-forest-light mb-3" />
                <p className="text-2xl font-bold text-foreground">{formatZAR(sellerFinances?.netProfit || 0)}</p>
                <p className="text-sm text-muted-foreground">Net Profit</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Tax Records</h3>
                <Button className="gap-2" onClick={() => {
                  const newTaxForm = { ...taxForm };
                  setTaxForm(newTaxForm);
                  alert("Tax form ready. Fill in revenue and expenses below.");
                }}>
                  <Plus className="h-4 w-4" /> Add Tax Record
                </Button>
              </div>

              {/* Add Tax Form */}
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-foreground mb-4">New Tax Record</h4>
                <form onSubmit={handleAddTaxRecord} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Quarter</Label>
                      <select 
                        value={taxForm.quarter}
                        onChange={(e) => setTaxForm({ ...taxForm, quarter: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option>Q1</option>
                        <option>Q2</option>
                        <option>Q3</option>
                        <option>Q4</option>
                      </select>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input 
                        type="number" 
                        value={taxForm.year}
                        onChange={(e) => setTaxForm({ ...taxForm, year: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Revenue (R)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={taxForm.revenue}
                        onChange={(e) => setTaxForm({ ...taxForm, revenue: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Expenses (R)</Label>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={taxForm.expenses}
                        onChange={(e) => setTaxForm({ ...taxForm, expenses: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Calculate & Save Tax Record</Button>
                </form>
              </div>

              {/* Tax Records List */}
              <div className="space-y-3">
                {currentUser.taxRecords && currentUser.taxRecords.length > 0 ? (
                  currentUser.taxRecords.map((record) => (
                    <div key={record.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{record.quarter} {record.year}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Revenue: {formatZAR(record.revenue)} | Expenses: {formatZAR(record.expenses)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Taxable Income: {formatZAR(record.taxableIncome)} | Tax @28%: {formatZAR(record.taxAmount)}
                          </p>
                        </div>
                        <Badge className={record.status === "paid" ? "bg-harvest/10 text-harvest" : "bg-yellow-50 text-yellow-900"}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tax records yet. Add one to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === "employees" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
              <Button className="gap-2" onClick={() => setShowAddEmployee(true)}>
                <UserPlus className="h-4 w-4" /> Add Employee
              </Button>
            </div>

            {/* Add Employee Form */}
            {showAddEmployee && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-4">New Employee</h4>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="e.g., Thabo Mkhize"
                        value={employeeForm.name}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        placeholder="employee@example.com"
                        value={employeeForm.email}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        placeholder="+27 123 456 7890"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input 
                        placeholder="e.g., Sales Manager"
                        value={employeeForm.role}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Monthly Salary (R)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={employeeForm.salary}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">Add Employee</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Employees List */}
            <div className="space-y-3">
              {currentUser.employees && currentUser.employees.length > 0 ? (
                currentUser.employees.map((emp) => (
                  <div key={emp.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.role} · {emp.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        {emp.salary && <p className="font-semibold text-foreground">{formatZAR(emp.salary)}/month</p>}
                        <Badge className={emp.status === "active" ? "bg-harvest/10 text-harvest" : "bg-gray-100 text-gray-700"}>
                          {emp.status}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleRemoveEmployee(emp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No employees added yet. Add your first team member!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === "loans" && (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">💰 Small Business Loan Program</h3>
              <p className="text-muted-foreground mb-4">
                Access quick loans to grow your business. Interest rate: 12% per annum, flexible tenure.
              </p>
              <Button className="gap-2" disabled>
                <Briefcase className="h-4 w-4" /> Apply for Loan (Coming Soon)
              </Button>
            </div>

            {currentUser.loanApplications && currentUser.loanApplications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">My Loan Applications</h3>
                <div className="space-y-3">
                  {currentUser.loanApplications.map((loan) => (
                    <div key={loan.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{formatZAR(loan.amount)}</p>
                          <p className="text-xs text-muted-foreground">{loan.purpose} · {loan.tenure} months</p>
                        </div>
                        <Badge className={loan.status === "approved" ? "bg-harvest/10 text-harvest" : "bg-yellow-50 text-yellow-900"}>
                          {loan.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-display font-bold text-foreground mb-6">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label>Product Images (up to 3)</Label>
                  <div className="flex gap-3 mt-2">
                    {productImages.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {productImages.length < 3 && (
                      <button
                        type="button"
                        onClick={() => document.getElementById("product-images")?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <input id="product-images" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </div>

                <div>
                  <Label>Product Name *</Label>
                  <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Organic Tomatoes" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Price (ZAR) *</Label>
                    <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="35.00" />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} placeholder="kg" />
                  </div>
                  <div>
                    <Label>MOQ</Label>
                    <Input type="number" value={productForm.moq} onChange={(e) => setProductForm({ ...productForm, moq: e.target.value })} placeholder="1" />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe your product..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                  <Button type="submit" variant="harvest" className="flex-1">List Product</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Special Offer Modal */}
        {showAddSpecial && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl border border-border p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-foreground">Create Special Offer</h2>
                <button onClick={() => setShowAddSpecial(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddSpecial} className="space-y-4">
                <div>
                  <Label>Product to Promote</Label>
                  <select
                    value={specialForm.product}
                    onChange={(e) => setSpecialForm({ ...specialForm, product: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choose a product</option>
                    {mockInventory.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      value={specialForm.discount}
                      onChange={(e) => setSpecialForm({ ...specialForm, discount: e.target.value })}
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div>
                    <Label>Valid for (Days)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={specialForm.expiryDays}
                      onChange={(e) => setSpecialForm({ ...specialForm, expiryDays: e.target.value })}
                      placeholder="e.g. 7"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-primary font-medium">
                    💡 Special will expire in {specialForm.expiryDays || 0} days
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddSpecial(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="flex-1 gap-2">
                    <Zap className="h-4 w-4" /> Launch Special
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
