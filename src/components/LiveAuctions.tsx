import AuctionCard from "./AuctionCard";
import { mockAuctions } from "@/lib/data";

const LiveAuctions = () => {
  return (
    <section id="auctions" className="py-16 bg-background">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-3 w-3 rounded-full bg-auction-hot animate-pulse" />
              <span className="text-sm font-semibold text-auction-hot uppercase tracking-wider">Live Now</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">Auction House</h2>
            <p className="text-muted-foreground mt-2">Bid on livestock, machinery, and bulk harvests in real-time</p>
          </div>
          <a href="/auction-house" className="hidden sm:block text-sm font-medium text-primary hover:underline">All auctions →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {mockAuctions.map((a) => (
            <AuctionCard key={a.id} title={a.title} image={a.image} currentBid={a.currentBid} totalBids={a.totalBids} endsInMs={a.endsInMs} vendor={a.vendor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveAuctions;
