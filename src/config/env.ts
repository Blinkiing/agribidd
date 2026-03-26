/**
 * Environment Configuration
 * Safely expose environment variables with validation
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  paypal: {
    clientId: string;
  };
  app: {
    name: string;
    currency: string;
    environment: "development" | "production";
  };
}

const getConfig = (): Config => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  // Validate environment variables in production
  if (import.meta.env.PROD) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."
      );
    }
    if (!paypalClientId) {
      throw new Error(
        "Missing PayPal credentials. Please set VITE_PAYPAL_CLIENT_ID in your environment."
      );
    }
  }

  return {
    supabase: {
      url: supabaseUrl || "http://localhost:54321",
      anonKey: supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    },
    paypal: {
      clientId:
        paypalClientId || "sb",
    },
    app: {
      name: "AgriBid",
      currency: "ZAR",
      environment: import.meta.env.PROD ? "production" : "development",
    },
  };
};

export const config = getConfig();
