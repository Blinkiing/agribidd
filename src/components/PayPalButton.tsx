import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface PayPalButtonProps {
  amount: number;
  onSuccess: (orderId: string) => void;
  onError?: () => void;
  style?: {
    layout?: "vertical" | "horizontal";
    shape?: "pill" | "rect";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    label?: "paypal" | "checkout" | "buynow" | "pay" | "installment";
  };
}

interface PayPalOrder {
  orderID: string;
}

interface PayPalActions {
  order: {
    create: (options: unknown) => Promise<string>;
    capture: () => Promise<PayPalOrder>;
  };
}

interface PayPalCreateData {
  [key: string]: unknown;
}

interface PayPalButtons {
  render: (selector: string | HTMLElement) => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style: unknown;
        createOrder: (data: PayPalCreateData, actions: PayPalActions) => Promise<string>;
        onApprove: (data: PayPalOrder, actions: PayPalActions) => Promise<void>;
        onError: () => void;
        onCancel: () => void;
      }) => PayPalButtons;
    };
  }
}

const getPayPalClientId = (): string => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  if (!clientId) {
    throw new Error("PayPal client ID not configured. Check your .env.local file.");
  }
  return clientId;
};

const loadPayPalScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.paypal) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="paypal"]')) {
      const checkPayPal = setInterval(() => {
        if (window.paypal?.Buttons) {
          clearInterval(checkPayPal);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${getPayPalClientId()}&currency=ZAR`;
    script.async = true;
    script.onload = () => {
      // Wait for paypal object to be available
      const checkPayPal = setInterval(() => {
        if (window.paypal?.Buttons) {
          clearInterval(checkPayPal);
          resolve();
        }
      }, 100);
    };
    script.onerror = () => {
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.head.appendChild(script);
  });
};

export const PayPalButton = ({
  amount,
  onSuccess,
  onError,
  style = { layout: "vertical", shape: "pill", color: "blue", label: "paypal" },
}: PayPalButtonProps) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<PayPalButtons | null>(null);
  const renderAttemptRef = useRef(0);

  // Validate amount is not already in cents
  if (amount > 999999) {
    console.warn('⚠️ PayPal amount appears to be in cents. Amount:', amount);
  }

  useEffect(() => {
    const renderPayPalButtons = async () => {
      try {
        if (!paypalRef.current) return;

        // Load PayPal SDK if not already loaded
        await loadPayPalScript();

        if (!window.paypal?.Buttons) {
          toast.error("PayPal SDK failed to load");
          return;
        }

        // Only render if not already rendered
        if (buttonsRef.current) {
          return;
        }

        // Clear previous content
        paypalRef.current.innerHTML = "";

        // Ensure amount is in correct format (ZAR as decimal, not cents)
        const paypalAmount = Math.abs(amount) > 999999 ? (amount / 100).toFixed(2) : amount.toFixed(2);

        const buttons = window.paypal.Buttons({
          style: style,
          createOrder: (data: PayPalCreateData, actions: PayPalActions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "ZAR",
                    value: paypalAmount,
                  },
                },
              ],
            });
          },
          onApprove: (data: PayPalOrder, actions: PayPalActions) => {
            return actions.order.capture().then(() => {
              toast.success("Payment completed successfully!");
              onSuccess(data.orderID);
            });
          },
          onError: () => {
            toast.error("Payment failed. Please try again.");
            onError?.();
          },
          onCancel: () => {
            toast.info("Payment cancelled");
          },
        });

        buttonsRef.current = buttons;
        buttons.render(paypalRef.current);
      } catch (error) {
        console.error("PayPal button error:", error);
        toast.error("Failed to initialize PayPal. Please try again.");
        onError?.();
      }
    };

    renderPayPalButtons();
  }, [amount, onSuccess, onError, style]);

  return <div ref={paypalRef} className="w-full" />;
};

export default PayPalButton;
