import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Target, Leaf } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-16 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-display font-bold text-foreground mb-4">About AgriBid</h1>
            <p className="text-xl text-muted-foreground">Revolutionizing agriculture through direct connections between farmers and buyers</p>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-12">
          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                To connect farmers and agricultural suppliers directly with buyers, eliminating unnecessary middlemen and ensuring fair prices for quality produce.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe in transparency, quality, and empowering every participant in the agricultural value chain.
              </p>
            </div>
            <Card className="bg-primary/10 border-primary/20 p-8 flex items-center justify-center">
              <Target className="h-24 w-24 text-harvest/60" />
            </Card>
          </div>

          {/* Why AgriBid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Leaf,
                title: "Fresh Direct",
                description: "Farm-fresh products delivered directly from producers to consumers",
              },
              {
                icon: Users,
                title: "Fair Prices",
                description: "Transparent pricing with no middlemen markup",
              },
              {
                icon: Target,
                title: "Real-time Auctions",
                description: "Competitive bidding for bulk orders and specialized products",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-6 border border-border">
                  <Icon className="h-8 w-8 text-harvest mb-4" />
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                ["Transparency", "We believe in clear, honest communication"],
                ["Quality", "We prioritize quality products and service"],
                ["Trust", "We build long-term relationships with our community"],
                ["Innovation", "We continuously improve the agricultural marketplace"],
              ].map((value, idx) => (
                <div key={idx} className="borders border-b pb-4">
                  <h3 className="font-bold text-foreground mb-2">{value[0]}</h3>
                  <p className="text-muted-foreground">{value[1]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-harvest/10 rounded-lg p-8 text-center border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">Whether you're a buyer or seller, AgriBid connects you with fresh opportunities</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button variant="harvest" onClick={() => window.location.href = "/become-seller"}>
                Become a Seller
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Start Buying
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
