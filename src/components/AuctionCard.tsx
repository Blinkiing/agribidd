import { useState, useEffect } from "react";
import { Gavel, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatZAR } from "@/lib/data";

interface AuctionCardProps {
  title: string;
  image: string;
  currentBid: number;
  totalBids: number;
  endsInMs: number;
  vendor: string;
}

const formatTime = (ms: number) => {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return { h, m, s };
};

const AuctionCard = ({ title, image, currentBid, totalBids, endsInMs, vendor }: AuctionCardProps) => {
  const [remaining, setRemaining] = useState(endsInMs);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const time = formatTime(remaining);
  const isUrgent = remaining < 3600000;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group rounded-xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-elevated transition-all"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-foreground/80 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full">
          <Clock className="h-3.5 w-3.5" />
          <span className={`text-xs font-mono font-bold ${isUrgent ? "text-auction-hot animate-countdown-tick" : ""}`}>
            {time.h}:{time.m}:{time.s}
          </span>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-auction-hot/90 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
          <span className="text-xs font-bold">LIVE</span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs text-muted-foreground">{vendor}</p>
        <h3 className="font-display font-semibold text-lg text-foreground leading-tight">{title}</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Bid</p>
            <p className="text-2xl font-bold text-primary">{formatZAR(currentBid)}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">{totalBids} bids</span>
            </div>
          </div>
        </div>

        <Button variant="bid" className="w-full gap-2" size="lg">
          <Gavel className="h-4 w-4" /> Place Bid
        </Button>
      </div>
    </motion.div>
  );
};

export default AuctionCard;
