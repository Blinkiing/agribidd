// Mock Authentication Service - Offline/Local Development
// Uses localStorage instead of Supabase

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  accountType: "buyer" | "seller" | "admin";
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
  businessName?: string;
  businessLocation?: string;
  businessLogo?: string;
  specialty?: string;
  bio?: string;
}

export type AuthUser = UserProfile | null;

// Mock data storage
const USERS_STORAGE_KEY = "mock_users";
const SESSIONS_STORAGE_KEY = "mock_sessions";
const CURRENT_SESSION_KEY = "mock_current_session";

interface MockUser extends UserProfile {
  password: string;
}

/**
 * Get all mock users from localStorage
 */
function getAllUsers(): MockUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading users from storage:", error);
    return [];
  }
}

/**
 * Save users to localStorage
 */
function saveUsers(users: MockUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to storage:", error);
  }
}

/**
 * Generate a mock UUID
 */
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Mock Authentication Service
 */
export const mockAuthService = {
  async signUp(data: SignUpData) {
    const { email, password, name, phone, accountType } = data;

    console.log("📝 [MOCK] Attempting sign up with email:", email, "as", accountType);

    const users = getAllUsers();

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    // Create new user
    const newUser: MockUser = {
      id: generateId(),
      email,
      name,
      phone: phone || undefined,
      accountType,
      password,
      walletBalance: 0,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    console.log("✅ [MOCK] User created:", newUser.id);
    console.log("📥 [MOCK] Auto sign-in...");

    // Auto sign in
    const session = {
      userId: newUser.id,
      email: newUser.email,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));

    return {
      user: { id: newUser.id, email: newUser.email },
      session,
    };
  },

  async signIn(data: SignInData) {
    const { email, password } = data;

    console.log("🔐 [MOCK] Attempting sign in with email:", email);

    const users = getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.password !== password) {
      throw new Error("Invalid password");
    }

    console.log("✅ [MOCK] Sign in successful!");

    const session = {
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));

    return {
      user: { id: user.id, email: user.email },
      session,
    };
  },

  async getSession() {
    try {
      const session = localStorage.getItem(CURRENT_SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error("Failed to get session:", error);
      return null;
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const session = localStorage.getItem(CURRENT_SESSION_KEY);
      if (!session) return null;

      const { userId } = JSON.parse(session);
      const users = getAllUsers();
      const user = users.find((u) => u.id === userId);

      if (!user) return null;

      const { password, ...profile } = user;
      return profile;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },

  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const users = getAllUsers();
      const user = users.find((u) => u.id === userId);

      if (!user) return null;

      const { password, ...profile } = user;
      return profile;
    } catch (error) {
      console.error("Failed to get user:", error);
      return null;
    }
  },

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const users = getAllUsers();
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) return null;

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        id: users[userIndex].id,
        password: users[userIndex].password,
        createdAt: users[userIndex].createdAt,
      };

      saveUsers(users);

      const { password, ...profile } = users[userIndex];
      return profile;
    } catch (error) {
      throw new Error(
        `Failed to update profile: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },

  async signOut(): Promise<void> {
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY);
      console.log("✅ [MOCK] Signed out");
    } catch (error) {
      throw new Error(
        `Sign out failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    // Simulate auth state listener with localStorage listener
    const checkSession = async () => {
      const user = await this.getCurrentUser();
      console.log("🔐 [MOCK] Auth state check - user:", user?.email || "null");
      callback(user);
    };

    // Initial check
    checkSession();

    // Listen for storage changes (from another tab or immediate signin)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CURRENT_SESSION_KEY) {
        console.log("📺 [MOCK] Session storage changed, checking auth state");
        checkSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also poll for changes every 500ms to catch rapid signin attempts
    const interval = setInterval(() => {
      checkSession();
    }, 500);

    // Return unsubscribe function
    return {
      unsubscribe: () => {
        console.log("📺 [MOCK] Auth listener unsubscribed");
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(interval);
      },
    };
  },

  async resetPassword(email: string): Promise<void> {
    console.log("📧 [MOCK] Password reset email sent to:", email);
  },

  async updatePassword(newPassword: string): Promise<void> {
    const session = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!session) throw new Error("Not logged in");

    const { userId } = JSON.parse(session);
    const users = getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) throw new Error("User not found");

    users[userIndex].password = newPassword;
    saveUsers(users);

    console.log("✅ [MOCK] Password updated");
  },
};

/**
 * Initialize mock data with sample users (for development)
 */
export function initializeMockData(): void {
  const existingUsers = getAllUsers();

  if (existingUsers.length > 0) {
    console.log("📚 [MOCK] Mock data already initialized");
    return;
  }

  const sampleUsers: MockUser[] = [];

  saveUsers(sampleUsers);
  console.log("📚 [MOCK] Mock data store initialized (empty)");
}
