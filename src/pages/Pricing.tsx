import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, DollarSign } from "lucide-react";

const Pricing = () => {
  const tiers = [
    {
      name: "Starter",
      description: "Perfect for new sellers",
      commission: "5%",
      minOrders: 0,
      features: [
        "Unlimited product listings",
        "Basic seller dashboard",
        "Email support",
        "Standard transaction processing",
        "Monthly payouts",
      ],
    },
    {
      name: "Professional",
      description: "For established sellers",
      commission: "3%",
      minOrders: 50,
      features: [
        "All Starter features",
        "Advanced analytics",
        "Priority email support",
        "Bulk pricing options",
        "Weekly payouts",
        "Marketing tools",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For high-volume sellers",
      commission: "Custom",
      minOrders: 500,
      features: [
        "All Professional features",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom integration options",
        "Daily payouts",
        "API access",
        "White-label options",
      ],
    },
  ];

  const moqTable = [
    { category: "Fresh Produce", moq: "5 kg - 50 kg", unit: "per order" },
    { category: "Grains & Cereals", moq: "10 kg - 100 kg", unit: "per order" },
    { category: "Dairy Products", moq: "2 L - 20 L", unit: "per order" },
    { category: "Meat & Butchery", moq: "2 kg - 10 kg", unit: "per order" },
    { category: "Prepared Foods", moq: "1 box - 50 boxes", unit: "per order" },
    { category: "Seeds & Inputs", moq: "1 kg - 50 kg", unit: "per order" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 px-4">
          <div className="container max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DollarSign className="h-8 w-8 text-harvest" />
              <h1 className="text-4xl font-display font-bold text-foreground">Simple, Transparent Pricing</h1>
            </div>
            <p className="text-muted-foreground text-lg">Choose a plan that works for your business</p>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="container max-w-5xl mx-auto py-12 px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`p-6 border flex flex-col ${
                  tier.highlighted
                    ? "border-harvest bg-harvest/5 ring-2 ring-harvest/30"
                    : "border-border"
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-harvest text-accent-foreground text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-foreground mb-1">{tier.commission}</div>
                  <p className="text-xs text-muted-foreground">commission per transaction</p>
                  {tier.minOrders > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">Min. {tier.minOrders} orders/month</p>
                  )}
                </div>
                <Button
                  variant={tier.highlighted ? "harvest" : "outline"}
                  className="mb-6 w-full"
                  onClick={() => window.location.href = "/become-seller"}
                >
                  Get Started
                </Button>
                <div className="space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-harvest flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* MOQ Table */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Minimum Order Quantities (MOQ)</h2>
            <Card className="border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">MOQ</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {moqTable.map((row) => (
                      <tr key={row.category} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-3 text-sm text-foreground">{row.category}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{row.moq}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
