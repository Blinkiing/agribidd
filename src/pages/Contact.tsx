import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 px-4">
          <div className="container max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="h-8 w-8 text-harvest" />
              <h1 className="text-4xl font-display font-bold text-foreground">Get in Touch</h1>
            </div>
            <p className="text-muted-foreground text-lg">We'd love to hear from you</p>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-5xl mx-auto py-12 px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail className="h-6 w-6 text-harvest flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Email</h3>
                    <a href="mailto:support@agribid.com" className="text-muted-foreground hover:text-foreground transition-colors">
                      support@agribid.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="h-6 w-6 text-harvest flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Phone</h3>
                    <a href="tel:+27123456789" className="text-muted-foreground hover:text-foreground transition-colors">
                      +27 (0)12 345 6789
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 text-harvest flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      123 Agricultural Hub<br />
                      Johannesburg, 2000<br />
                      South Africa
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <Card className="mt-8 p-6 border border-border bg-secondary/30">
                <h3 className="font-bold text-foreground mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours during business days.
                </p>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm">Name</Label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm">Subject</Label>
                  <Input
                    type="text"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm">Message</Label>
                  <textarea
                    placeholder="Your message here..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm mt-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <Button variant="harvest" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
