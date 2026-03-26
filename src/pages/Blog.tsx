import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, User, ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "5 Tips for Auction Success",
      excerpt: "Learn the best strategies for bidding and winning auctions on AgriBid.",
      author: "Sarah Johnson",
      date: "March 15, 2024",
      category: "Tips & Tricks",
      image: "🎯",
    },
    {
      id: 2,
      title: "Supplier Spotlight: Meet Our Best Sellers",
      excerpt: "Get to know the farmers and producers who make AgriBid great.",
      author: "Marcus Davis",
      date: "March 10, 2024",
      category: "Supplier Stories",
      image: "⭐",
    },
    {
      id: 3,
      title: "Quality Control: How We Ensure Fresh Produce",
      excerpt: "Our commitment to delivering only the freshest, highest-quality produce.",
      author: "Emily Chen",
      date: "March 5, 2024",
      category: "Quality",
      image: "✅",
    },
    {
      id: 4,
      title: "Using Live Auctions to Find Best Prices",
      excerpt: "Real-time bidding strategies for buyers looking to maximize value.",
      author: "James Wilson",
      date: "Feb 28, 2024",
      category: "Buying Guides",
      image: "📈",
    },
    {
      id: 5,
      title: "Seller Guide: Getting Started on AgriBid",
      excerpt: "Everything you need to know to start selling your products.",
      author: "Linda Martinez",
      date: "Feb 22, 2024",
      category: "Getting Started",
      image: "🚀",
    },
    {
      id: 6,
      title: "Market Trends: What's Hot in Produce",
      excerpt: "Seasonal trends and what smart buyers are looking for.",
      author: "Robert Singh",
      date: "Feb 15, 2024",
      category: "Market Analysis",
      image: "📊",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 px-4">
          <div className="container max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">AgriBid Blog</h1>
            <p className="text-muted-foreground text-lg">
              Tips, trends, and insights from the agricultural marketplace
            </p>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="container max-w-5xl mx-auto py-12 px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {posts.map((post, index) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-border">
                <div className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{post.image}</span>
                    <span className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">
                      {post.category}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">{post.excerpt}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Newsletter */}
          <Card className="p-8 text-center border border-border bg-gradient-to-br from-primary/5 to-harvest/5">
            <h2 className="text-2xl font-bold text-foreground mb-2">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest tips, trends, and market insights.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button variant="harvest">Subscribe</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;
