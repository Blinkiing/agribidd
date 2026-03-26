import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ShoppingBag,
  AlertCircle,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  Flag,
  MessageSquare,
  Download,
} from "lucide-react";
import { formatZAR } from "@/lib/data";

const BuyerDashboard = () => {
  const { currentUser, orders, getOrdersByUser, createDispute, disputes, getDisputesByUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [disputeForm, setDisputeForm] = useState({
    reason: "",
    description: "",
  });

  if (!currentUser || currentUser.accountType !== "buyer") {
    return null;
  }

  const userOrders = getOrdersByUser(currentUser.id);
  const userDisputes = getDisputesByUser(currentUser.id);
  const totalSpent = userOrders.reduce((sum, o) => sum + o.amount, 0);
  const deliveredOrders = userOrders.filter((o) => o.status === "delivered").length;

  const handleCreateDispute = () => {
    if (!selectedOrder || !disputeForm.reason || !disputeForm.description) {
      alert("Please fill all fields");
      return;
    }

    const order = userOrders.find((o) => o.id === selectedOrder);
    if (order) {
      createDispute(order.orderId, currentUser.id, order.sellerId, disputeForm.reason, disputeForm.description);
      setDisputeForm({ reason: "", description: "" });
      setSelectedOrder(null);
      alert("Dispute lodged successfully!");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-700",
      processing: "bg-blue-500/20 text-blue-700",
      shipped: "bg-primary/20 text-primary",
      delivered: "bg-harvest/20 text-harvest",
      cancelled: "bg-red-500/20 text-red-600",
    };
    return colors[status] || "bg-gray-500/20 text-gray-700";
  };

  const getDisputeStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-500/20 text-red-700",
      in_review: "bg-blue-500/20 text-blue-700",
      resolved: "bg-harvest/20 text-harvest",
      closed: "bg-gray-500/20 text-gray-600",
    };
    return colors[status] || "bg-gray-500/20 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}!</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{formatZAR(totalSpent)}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <Wallet className="h-5 w-5 text-harvest" />
              </div>
              <p className="text-2xl font-bold text-foreground">{formatZAR(currentUser.walletBalance)}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{userOrders.length}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Delivered</p>
                <CheckCircle className="h-5 w-5 text-forest-light" />
              </div>
              <p className="text-2xl font-bold text-foreground">{deliveredOrders}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="disputes" className="gap-2">
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Disputes</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">My Orders</h2>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No orders yet. Start shopping!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {userOrders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-secondary/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{order.productName}</h3>
                            <p className="text-sm text-muted-foreground">Order ID: {order.orderId}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Qty: {order.quantity}</span>
                              <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                            <div>
                              <p className="text-lg font-bold text-foreground">{formatZAR(order.amount)}</p>
                              <Badge className={`${getStatusColor(order.status)} text-xs capitalize`}>
                                {order.status}
                              </Badge>
                            </div>

                            {order.status === "delivered" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => setSelectedOrder(order.id)}
                                  >
                                    <Flag className="h-4 w-4" />
                                    Lodge Dispute
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Lodge a Dispute</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <label className="text-sm font-medium text-foreground">Reason for Dispute</label>
                                      <select
                                        value={disputeForm.reason}
                                        onChange={(e) =>
                                          setDisputeForm({ ...disputeForm, reason: e.target.value })
                                        }
                                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                                      >
                                        <option value="">Select a reason...</option>
                                        <option value="damaged">Item Damaged</option>
                                        <option value="wrong-item">Wrong Item Received</option>
                                        <option value="quality">Quality Issue</option>
                                        <option value="not-received">Not Received</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-foreground">Description</label>
                                      <textarea
                                        value={disputeForm.description}
                                        onChange={(e) =>
                                          setDisputeForm({ ...disputeForm, description: e.target.value })
                                        }
                                        placeholder="Describe the issue in detail..."
                                        className="w-full mt-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card min-h-24"
                                      />
                                    </div>

                                    <Button className="w-full" onClick={handleCreateDispute}>
                                      Submit Dispute
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Disputes Tab */}
            <TabsContent value="disputes" className="mt-6">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">My Disputes</h2>
                </div>

                {userDisputes.length === 0 ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No disputes yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {userDisputes.map((dispute) => (
                      <div key={dispute.id} className="p-6 hover:bg-secondary/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground capitalize">{dispute.reason}</h3>
                              <Badge className={`${getDisputeStatusColor(dispute.status)} text-xs capitalize`}>
                                {dispute.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{dispute.description}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>ID: {dispute.id}</span>
                              <span>Order: {dispute.orderId}</span>
                              <span>Filed: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                            </div>
                            {dispute.resolution && (
                              <div className="mt-3 p-2 bg-secondary/30 rounded text-sm">
                                <p className="text-muted-foreground">
                                  <strong>Resolution:</strong> {dispute.resolution}
                                </p>
                              </div>
                            )}
                          </div>

                          <Button size="sm" variant="outline" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="help" className="mt-6">
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">Help & Support</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Track Your Orders</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Monitor the status of your purchases in real-time
                    </p>
                    <Button variant="outline" size="sm">
                      View Orders
                    </Button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Report an Issue</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Having problems? Lodge a dispute with detailed documentation
                    </p>
                    <Button variant="outline" size="sm">
                      <Flag className="h-4 w-4 mr-2" />
                      Lodge Dispute
                    </Button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Wallet Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your wallet balance and transaction history
                    </p>
                    <Button variant="outline" size="sm">
                      <Wallet className="h-4 w-4 mr-2" />
                      Go to Wallet
                    </Button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Download Invoices</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download receipt and invoice documents for your orders
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-secondary/30 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Contact Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Need assistance? Our support team is available 24/7
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-foreground">
                      <strong>Email:</strong> support@agribid.com
                    </p>
                    <p className="text-foreground">
                      <strong>Hours:</strong> 24/7
                    </p>
                    <p className="text-foreground">
                      <strong>Average Response:</strong> &lt;2 hours
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
