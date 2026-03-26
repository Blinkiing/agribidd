import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const fallbackRedirectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Sign up state
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const redirectToParam = new URLSearchParams(location.search).get("redirectTo");
  const safeRedirectTo =
    redirectToParam && redirectToParam.startsWith("/") ? redirectToParam : null;

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !signUpSuccess) {
      // Clear any pending fallback redirect
      if (fallbackRedirectTimeoutRef.current) {
        clearTimeout(fallbackRedirectTimeoutRef.current);
      }

      console.log("✅ Current user detected:", currentUser.id, currentUser.accountType);
      console.log("🚀 Redirecting to dashboard based on account type:", currentUser.accountType);

      const fallback =
        currentUser.accountType === "admin"
          ? "/admin"
          : currentUser.accountType === "seller"
            ? "/seller-dashboard"
            : "/buyer-dashboard";

      // Navigate immediately
      navigate(safeRedirectTo ?? fallback, { replace: true });
    }
  }, [currentUser, navigate, safeRedirectTo, signUpSuccess]);

  // Cleanup fallback timeout on unmount
  useEffect(() => {
    return () => {
      if (fallbackRedirectTimeoutRef.current) {
        clearTimeout(fallbackRedirectTimeoutRef.current);
      }
    };
  }, []);

  const validateSignIn = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signInEmail.trim()) {
      newErrors.email = "Email is required";
    } else if (!signInEmail.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (!signInPassword) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUp = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signUpData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!signUpData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!signUpData.email.includes("@")) {
      newErrors.email = "Please enter a valid email";
    }

    if (!signUpData.password) {
      newErrors.password = "Password is required";
    } else if (signUpData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(signUpData.password)) {
      newErrors.password = "Password must contain lowercase letters";
    } else if (!/(?=.*[A-Z])/.test(signUpData.password)) {
      newErrors.password = "Password must contain uppercase letters";
    } else if (!/(?=.*\d)/.test(signUpData.password)) {
      newErrors.password = "Password must contain numbers";
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignIn()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      console.log("📝 Attempting sign in with email:", signInEmail);
      const result = await authService.signIn({
        email: signInEmail,
        password: signInPassword,
      });

      console.log("✅ Sign in successful!");
      
      // Get the user ID for remember me
      if (result.user?.id && rememberMe) {
        authService.setRememberMe(result.user.id, 30);
        console.log("✅ Remember me set");
      }

      toast.success("Signed in successfully!");

      // Clear form on success
      setSignInEmail("");
      setSignInPassword("");
      setRememberMe(false);
      setErrors({});

      // Set a timeout fallback in case the auth listener is slow to update
      // The useEffect will handle redirect when currentUser updates, this is just a safety net
      fallbackRedirectTimeoutRef.current = setTimeout(() => {
        console.warn("⏰ Auth context update delayed, using fallback redirect");
        // Default to buyer dashboard for safety - auth context will correct if needed
        navigate(safeRedirectTo ?? "/buyer-dashboard", { replace: true });
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Sign in failed";
      console.error("❌ Sign in error:", errorMsg);
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUp()) {
      return;
    }

    const nextDestination = safeRedirectTo ?? "/buyer-dashboard";

    setIsLoading(true);
    setErrors({});
    
    try {
      console.log("📝 Attempting sign up with email:", signUpData.email);
      const result = await authService.signUp({
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password,
        phone: signUpData.phone || undefined,
        accountType: "buyer",
      });

      console.log("✅ Sign up successful:", result);
      setSignUpSuccess(true);
      toast.success("Account created successfully!");

      // Reset form
      setSignUpData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      });

      // Redirect after a delay based on account type
      setTimeout(() => {
        console.log("🚀 Redirecting after sign up:", nextDestination);
        navigate(nextDestination, { replace: true });
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Sign up failed";
      console.error("❌ Sign up error:", errorMsg);
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: "Email is required" });
      return;
    }
    
    if (!forgotEmail.includes("@")) {
      setErrors({ forgotEmail: "Please enter a valid email" });
      return;
    }

    setForgotLoading(true);
    try {
      console.log("🔄 Sending password reset email to:", forgotEmail);
      await authService.resetPassword(forgotEmail);
      console.log("✅ Password reset email sent");
      setForgotSent(true);
      toast.success("Password reset email sent! Check your inbox.");
      setForgotEmail("");
      setErrors({});

      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSent(false);
      }, 5000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send reset email";
      console.error("❌ Password reset error:", errorMsg);
      toast.error(errorMsg);
      setErrors({ forgotEmail: errorMsg });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <div className="flex-1 py-8 px-4 sm:py-12 flex items-center justify-center">
        <div className="container max-w-md mx-auto w-full">
          {!showForgotPassword ? (
            <>
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-3">
                  <Logo size="lg" className="text-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Fresh from Farm to Your Table
                </p>
              </div>

              {/* Tabs Card */}
              <Card className="p-6 sm:p-8 border border-border shadow-lg">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="inline sm:hidden">In</span>
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Sign Up</span>
                      <span className="inline sm:hidden">Up</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* SIGN IN TAB */}
                  <TabsContent value="signin" className="space-y-4">
                    {signUpSuccess ? (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                          Account Created!
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground mb-4">
                          Check your email to verify your account. Redirecting...
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSignIn} className="space-y-4">
                        {errors.submit && (
                          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                            <span className="text-sm text-destructive">{errors.submit}</span>
                          </div>
                        )}

                        {/* Email */}
                        <div>
                          <Label className="text-sm font-medium text-foreground">Email Address</Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              value={signInEmail}
                              onChange={(e) => {
                                setSignInEmail(e.target.value);
                                if (errors.email) setErrors({ ...errors, email: "" });
                              }}
                              className={`pl-10 text-sm ${errors.email ? "border-destructive" : ""}`}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-destructive mt-1">{errors.email}</p>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <Label className="text-sm font-medium text-foreground">Password</Label>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type={showSignInPassword ? "text" : "password"}
                              placeholder="Your password"
                              value={signInPassword}
                              onChange={(e) => {
                                setSignInPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: "" });
                              }}
                              className={`pl-10 pr-10 text-sm ${errors.password ? "border-destructive" : ""}`}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignInPassword(!showSignInPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showSignInPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-xs text-destructive mt-1">{errors.password}</p>
                          )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-border"
                            />
                            <span className="text-muted-foreground hover:text-foreground">
                              Remember me
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-primary hover:underline font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full mt-6"
                          variant="harvest"
                        >
                          {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                      </form>
                    )}
                  </TabsContent>

                  {/* SIGN UP TAB */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                      {errors.submit && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                          <span className="text-sm text-destructive">{errors.submit}</span>
                        </div>
                      )}

                      {/* Full Name */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Full Name</Label>
                        <div className="relative mt-1.5">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={signUpData.name}
                            onChange={(e) => {
                              setSignUpData({ ...signUpData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            className={`pl-10 text-sm ${errors.name ? "border-destructive" : ""}`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-xs text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Email Address</Label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={signUpData.email}
                            onChange={(e) => {
                              setSignUpData({ ...signUpData, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            className={`pl-10 text-sm ${errors.email ? "border-destructive" : ""}`}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Phone (Optional)</Label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="tel"
                            placeholder="+27 123 456 7890"
                            value={signUpData.phone}
                            onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                            className="pl-10 text-sm"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Password</Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type={showSignUpPassword ? "text" : "password"}
                            placeholder="Min 8 chars, 1 uppercase, 1 number"
                            value={signUpData.password}
                            onChange={(e) => {
                              setSignUpData({ ...signUpData, password: e.target.value });
                              if (errors.password) setErrors({ ...errors, password: "" });
                            }}
                            className={`pl-10 pr-10 text-sm ${errors.password ? "border-destructive" : ""}`}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSignUpPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-destructive mt-1">{errors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Confirm Password</Label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signUpData.confirmPassword}
                            onChange={(e) => {
                              setSignUpData({
                                ...signUpData,
                                confirmPassword: e.target.value,
                              });
                              if (errors.confirmPassword)
                                setErrors({ ...errors, confirmPassword: "" });
                            }}
                            className={`pl-10 pr-10 text-sm ${errors.confirmPassword ? "border-destructive" : ""}`}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2"
                        variant="harvest"
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Security Info */}
              <div className="mt-6 p-4 sm:p-6 bg-harvest/5 border border-harvest/20 rounded-lg text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  🔒 Your data is secure. We use Supabase encryption to protect your account.
                </p>
              </div>
            </>
          ) : (
            /* FORGOT PASSWORD MODAL */
            <>
              <Card className="p-6 sm:p-8 border border-border shadow-lg">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-muted-foreground hover:text-foreground mb-4 text-sm font-medium"
                >
                  ← Back to Login
                </button>

                {forgotSent ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      Check Your Email
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground mb-2">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-foreground mb-4">{forgotEmail}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Click the link in the email to reset your password. The link expires in 24 hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        Reset Password
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Enter your email and we'll send you a link to reset your password
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      {errors.forgotEmail && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                          <span className="text-sm text-destructive">
                            {errors.forgotEmail}
                          </span>
                        </div>
                      )}

                      <div>
                        <Label className="text-sm font-medium text-foreground">
                          Email Address
                        </Label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={forgotEmail}
                            onChange={(e) => {
                              setForgotEmail(e.target.value);
                              if (errors.forgotEmail)
                                setErrors({ ...errors, forgotEmail: "" });
                            }}
                            className="pl-10 text-sm"
                            disabled={forgotLoading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full"
                        variant="harvest"
                      >
                        {forgotLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
