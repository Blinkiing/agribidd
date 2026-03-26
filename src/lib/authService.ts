// Auth Service Selector - Switch between Mock and Real Auth
// Set USE_MOCK_AUTH=true to use offline mock auth

import { mockAuthService, initializeMockData } from "./mockAuth";
import { authService as realAuthService } from "./auth";

// Toggle this to switch between mock and real auth
const USE_MOCK_AUTH = true; // Set to false to use real Supabase

export type { SignUpData, SignInData, UserProfile, AuthUser } from "./auth";

// Initialize mock data if using mock auth
if (USE_MOCK_AUTH) {
  console.log("🔄 [OFFLINE MODE] Using mock authentication service");
  initializeMockData();
}

// Export the selected auth service
export const authService = USE_MOCK_AUTH ? mockAuthService : realAuthService;

// Helper to check if running in mock mode
export function isMockMode(): boolean {
  return USE_MOCK_AUTH;
}
