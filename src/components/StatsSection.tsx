import { motion } from "framer-motion";
import { Users, Store, TrendingUp, Award } from "lucide-react";

const stats = [
  { label: "Verified Farmers", value: "2,400+", icon: Users },
  { label: "Products Listed", value: "18,000+", icon: Store },
  { label: "Monthly Transactions", value: "R3.2M", icon: TrendingUp },
  { label: "Quality Assured", value: "99.4%", icon: Award },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="h-8 w-8 text-harvest mx-auto mb-3" />
              <p className="text-3xl font-display font-bold text-primary-foreground">{stat.value}</p>
              <p className="text-sm text-primary-foreground/70 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
