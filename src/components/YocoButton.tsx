import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";

interface YocoPayLinkProps {
  amount: number;
  onSuccess: (reference: string) => void;
  onError?: () => void;
  isLoading?: boolean;
  userId?: string;
}

const getYocoSecretKey = (): string => {
  const secretKey = import.meta.env.VITE_YOCO_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Yoco secret key not configured. Check your .env.local file.");
  }
  return secretKey;
};

/**
 * Generate Yoco Paylink
 * Uses the AgriBid Yoco link with dynamic amount and user ID
 */
const generateYocoPayLink = (amount: number, reference: string, userId?: string): string => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('amount', Math.round(amount * 100).toString()); // Convert to cents
    params.append('reference', reference);
    if (userId) {
      params.append('userId', userId);
    }
    params.append('currency', 'ZAR');
    
    // Use the provided AgriBid Yoco link
    const payLinkUrl = `https://pay.yoco.com/agribid?${params.toString()}`;
    
    return payLinkUrl;
  } catch (error) {
    console.error("Failed to generate Yoco Paylink:", error);
    throw error;
  }
};

export const YocoPayLink = ({ amount, onSuccess, onError, isLoading = false, userId }: YocoPayLinkProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [payLinkUrl, setPayLinkUrl] = useState<string | null>(null);

  const handleGeneratePayLink = async () => {
    try {
      setIsGenerating(true);
      const reference = `YOCO-${Date.now()}`;
      
      const url = generateYocoPayLink(amount, reference, userId);
      setPayLinkUrl(url);
      
      // Open Yoco payment link in new window
      window.open(url, "_blank");
      
      // Simulate success after a delay (in production, you'd verify via webhook)
      setTimeout(() => {
        toast.success("Payment initiated. Please complete on Yoco page.");
        onSuccess(reference);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating Yoco Paylink:", error);
      toast.error("Failed to generate payment link");
      onError?.();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePayLink}
      disabled={isLoading || isGenerating || amount <= 0}
      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
      size="lg"
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : `Pay ${amount.toFixed(2)} ZAR via Yoco`}
    </Button>
  );
};

export default YocoPayLink;

