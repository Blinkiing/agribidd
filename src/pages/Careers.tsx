import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

const Careers = () => {
  const jobs = [
    {
      title: "Senior Backend Engineer",
      location: "Remote",
      type: "Full-time",
      description: "Build scalable APIs and manage our growing database infrastructure",
    },
    {
      title: "Product Manager",
      location: "Johannesburg, South Africa",
      type: "Full-time",
      description: "Lead product strategy and drive user engagement across our platform",
    },
    {
      title: "Frontend Developer",
      location: "Remote",
      type: "Full-time",
      description: "Create beautiful, responsive interfaces for our web and mobile platforms",
    },
    {
      title: "Customer Success Manager",
      location: "Cape Town, South Africa",
      type: "Full-time",
      description: "Support our sellers and ensure they succeed on our platform",
    },
    {
      title: "Marketing Specialist",
      location: "Remote",
      type: "Full-time",
      description: "Drive growth through digital marketing and community engagement",
    },
    {
      title: "Data Analyst",
      location: "Remote",
      type: "Full-time",
      description: "Turn data into actionable insights to improve our platform",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 px-4">
          <div className="container max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Briefcase className="h-8 w-8 text-harvest" />
              <h1 className="text-4xl font-display font-bold text-foreground">Join Our Team</h1>
            </div>
            <p className="text-muted-foreground text-lg">Help us revolutionize agriculture</p>
          </div>
        </div>

        {/* Culture */}
        <div className="container max-w-4xl mx-auto py-12 px-4">
          <div className="bg-gradient-to-br from-primary/10 to-harvest/10 rounded-lg p-8 mb-12 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why AgriBid?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>💚 Mission-driven work in an emerging market</li>
              <li>🌱 Impact the lives of farmers and food security</li>
              <li>🤝 Collaborative, diverse team culture</li>
              <li>💰 Competitive compensation and benefits</li>
              <li>📈 Fast-paced, high-growth environment</li>
              <li>🏠 Flexible work arrangements</li>
            </ul>
          </div>

          {/* Open Positions */}
          <h2 className="text-2xl font-bold text-foreground mb-6">Open Positions</h2>
          <div className="grid gap-6">
            {jobs.map((job, idx) => (
              <Card key={idx} className="p-6 border border-border hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                    <div className="flex gap-3 text-sm text-muted-foreground mt-2">
                      <span>📍 {job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply Now
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </Card>
            ))}
          </div>

          {/* Email */}
          <div className="mt-12 bg-gradient-to-br from-primary/10 to-harvest/10 rounded-lg p-8 text-center border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Don't see what you're looking for?</h2>
            <p className="text-muted-foreground mb-6">Send us your profile and tell us how you can help</p>
            <a href="mailto:careers@agribid.com">
              <Button variant="harvest">careers@agribid.com</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
