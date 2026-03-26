import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I become a seller on AgriBid?",
      answer: "Click on 'Become a Seller' in the navigation menu. Fill out your business information, provide verification documents, and wait for admin approval. Once verified, you can start listing products.",
    },
    {
      question: "What are the pricing tiers for sellers?",
      answer: "We offer flexible pricing based on your sales volume. Standard tier is 5% commission, Premium tier (over 50 orders/month) is 3%, and Enterprise tier offers custom rates.",
    },
    {
      question: "How does the auction system work?",
      answer: "Set a starting price and end time for your auction. Buyers can place bids in real-time. The highest bidder wins when the auction ends. Payment is processed through our escrow system.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Yoco card payments, bank transfers, and credit/debit cards for wallet top-ups. All payments are processed securely through our payment gateway. Bank deposits require upload of proof of payment and admin verification.",
    },
    {
      question: "How long does verification take?",
      answer: "Seller verification typically takes 2-5 business days. We review your submitted documents and verify your business information. You'll receive email updates on your verification status.",
    },
    {
      question: "Can I return products?",
      answer: "Return policies are managed between buyers and sellers. We recommend discussing return terms before completing sales. Disputes are handled through our escrow system.",
    },
    {
      question: "How are disputes resolved?",
      answer: "If there's a disagreement, use the Dispute Resolution tool in your dashboard. Our admin team reviews the case and makes a fair decision based on evidence provided.",
    },
    {
      question: "What's the minimum order quantity (MOQ)?",
      answer: "MOQ depends on your product. Fresh produce typically starts at 5kg, while bulk items can be higher. You can set custom MOQ for each product.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 px-4">
          <div className="container max-w-3xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="h-8 w-8 text-harvest" />
              <h1 className="text-4xl font-display font-bold text-foreground">Frequently Asked Questions</h1>
            </div>
            <p className="text-muted-foreground">Find answers to common questions about selling on AgriBid</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="container max-w-3xl mx-auto py-12 px-4">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-border"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-left font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 py-3 bg-secondary/30 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-br from-primary/10 to-harvest/10 rounded-lg p-8 text-center border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">Our support team is here to help</p>
            <Button variant="harvest" onClick={() => window.location.href = "/contact"}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
