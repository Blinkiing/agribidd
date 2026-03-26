import { supabase } from "./supabase";

/* ================= TYPES ================= */

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  accountType?: "buyer" | "seller" | "admin";
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  accountType: "buyer" | "seller" | "admin";
  walletBalance: number;
  verified: boolean;
  createdAt: string;
}

/* ================= HELPERS ================= */

function mapUserProfile(data: any): UserProfile {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    accountType: data.account_type,
    walletBalance: data.wallet_balance || 0,
    verified: data.profile_complete || false,
    createdAt: data.created_at,
  };
}

/* ================= SERVICE ================= */

export const authService = {
  /* ================= SIGN UP ================= */
  async signUp(data: SignUpData) {
    const { email, password, name, phone, accountType = "buyer" } = data;

    try {
      console.log("📝 Signing up:", email);

      // 1. Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
            },
          },
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No auth user returned");

      const userId = authData.user.id;

      console.log("✅ Auth created:", userId);

      // 2. Insert profile (SAFE INSERT)
      const { error: insertError } = await supabase
        .from("users")
        .upsert(
          [
            {
              auth_id: userId,
              email,
              name,
              phone: phone || null,
              account_type: accountType,
            },
          ],
          { onConflict: "auth_id" }
        );

      if (insertError) {
        console.error("❌ Insert failed:", insertError.message);
        throw insertError;
      }

      console.log("✅ Profile created");

      // 3. Try auto login
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        console.warn("⚠️ Email confirmation may be required");
        return { user: authData.user, session: null };
      }

      console.log("✅ Auto login success");

      return { user: loginData.user, session: loginData.session };
    } catch (err: any) {
      console.error("❌ Signup failed:", err.message);
      throw new Error(err.message);
    }
  },

  /* ================= SIGN IN ================= */
  async signIn({ email, password }: SignInData) {
    try {
      console.log("🔐 Signing in:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("No user returned");

      console.log("✅ Login success:", user.id);

      // Ensure profile exists
      await this.ensureUserProfile(user);

      return data;
    } catch (err: any) {
      console.error("❌ Login failed:", err.message);
      throw new Error(err.message);
    }
  },

  /* ================= ENSURE PROFILE ================= */
  async ensureUserProfile(user: any) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (!data) {
        console.warn("⚠️ Creating missing profile...");

        const { error: insertError } = await supabase.from("users").upsert(
          [
            {
              auth_id: user.id,
              email: user.email,
              name: user.user_metadata?.name || "User",
              phone: user.user_metadata?.phone || null,
              account_type: "buyer",
            },
          ],
          { onConflict: "auth_id" }
        );

        if (insertError) {
          console.error("❌ Failed to create profile:", insertError.message);
        } else {
          console.log("✅ Profile auto-created");
        }
      }
    } catch (err) {
      console.error("❌ ensureUserProfile error:", err);
    }
  },

  /* ================= GET CURRENT USER ================= */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // Optimized single query with error handling
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        await this.ensureUserProfile(user);
        // Retry after creating profile
        const { data: retryData } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .single();
        return retryData ? mapUserProfile(retryData) : null;
      }

      if (error || !data) return null;

      return mapUserProfile(data);
    } catch (err) {
      console.error("❌ getCurrentUser error:", err);
      return null;
    }
  },

  /* ================= SIGN OUT ================= */
  async signOut() {
    await supabase.auth.signOut();
  },

  /* ================= AUTH LISTENER ================= */
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }

      // Single optimized query instead of multiple queries
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", session.user.id)
        .single();

      // If profile doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        await this.ensureUserProfile(session.user);
        // Retry after creating
        const { data: retryData } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();
        callback(retryData ? mapUserProfile(retryData) : null);
        return;
      }

      callback(data ? mapUserProfile(data) : null);
    });
  },

  /* ================= RESET PASSWORD ================= */
  async resetPassword(email: string) {
    try {
      console.log("🔄 Sending password reset email for:", email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      console.log("✅ Password reset email sent");
      return { success: true };
    } catch (err: any) {
      console.error("❌ Password reset failed:", err.message);
      throw new Error(err.message);
    }
  },

  /* ================= REMEMBER ME ================= */
  setRememberMe(userId: string, days: number) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      localStorage.setItem("rememberMe", JSON.stringify({
        userId,
        expiryDate: expiryDate.toISOString(),
      }));
      console.log(`✅ Remember me set for ${days} days`);
    } catch (err) {
      console.error("❌ Failed to set remember me:", err);
    }
  },

  clearRememberMe() {
    try {
      localStorage.removeItem("rememberMe");
      console.log("✅ Remember me cleared");
    } catch (err) {
      console.error("❌ Failed to clear remember me:", err);
    }
  },

  getRememberMe(): { userId: string; isValid: boolean } | null {
    try {
      const stored = localStorage.getItem("rememberMe");
      if (!stored) return null;

      const data = JSON.parse(stored);
      const expiryDate = new Date(data.expiryDate);
      const isValid = new Date() < expiryDate;

      if (!isValid) {
        this.clearRememberMe();
        return null;
      }

      return { userId: data.userId, isValid: true };
    } catch (err) {
      console.error("❌ Failed to get remember me:", err);
      return null;
    }
  },
};