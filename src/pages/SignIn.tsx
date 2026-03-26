import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const fallbackRedirectTimeoutRef = useRef<NodeJS.Timeout>();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sign in form
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");

  const redirectParam = new URLSearchParams(location.search).get("redirectTo");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : null;

  // Auto redirect if logged in
  useEffect(() => {
    if (currentUser) {
      if (fallbackRedirectTimeoutRef.current) {
        clearTimeout(fallbackRedirectTimeoutRef.current);
      }

      const fallback =
        currentUser.accountType === "admin"
          ? "/admin"
          : currentUser.accountType === "seller"
            ? "/seller-dashboard"
            : "/buyer-dashboard";

      navigate(safeRedirect ?? fallback, { replace: true });
    }
  }, [currentUser, navigate, safeRedirect]);

  useEffect(() => {
    return () => {
      if (fallbackRedirectTimeoutRef.current) {
        clearTimeout(fallbackRedirectTimeoutRef.current);
      }
    };
  }, []);

  const validateSignIn = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signInForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInForm.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!signInForm.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotEmail = (): boolean => {
    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: "Email is required" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ forgotEmail: "Please enter a valid email" });
      return false;
    }
    return true;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSignInForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignIn()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔐 Signing in:", signInForm.email);

      const result = await authService.signIn({
        email: signInForm.email,
        password: signInForm.password,
      });

      console.log("✅ Sign in successful");

      if (result.user?.id && signInForm.rememberMe) {
        authService.setRememberMe(result.user.id, 30);
        console.log("✅ Remember me set for 30 days");
      }

      toast.success("Signed in successfully!");

      setSignInForm({
        email: "",
        password: "",
        rememberMe: false,
      });
      setErrors({});

      // Fallback redirect
      fallbackRedirectTimeoutRef.current = setTimeout(() => {
        console.warn("⏰ Redirecting (fallback)");
        navigate(safeRedirect ?? "/buyer-dashboard", { replace: true });
      }, 2000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Sign in failed";
      console.error("❌ Sign in error:", errorMsg);

      if (errorMsg.includes("Invalid")) {
        setErrors({ submit: "Invalid email or password" });
        toast.error("Invalid email or password");
      } else if (errorMsg.includes("not confirmed")) {
        setErrors({
          submit: "Please verify your email before signing in",
        });
        toast.error("Email not verified. Check your inbox.");
      } else {
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForgotEmail()) {
      return;
    }

    setResetLoading(true);
    try {
      console.log("🔄 Sending password reset email to:", forgotEmail);
      await authService.resetPassword(forgotEmail);
      console.log("✅ Password reset email sent");
      setResetEmailSent(true);
      toast.success("Check your email for password reset instructions");

      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmailSent(false);
        setForgotEmail("");
        setErrors({});
      }, 4000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to send reset email";
      console.error("❌ Reset error:", errorMsg);
      setErrors({ forgotEmail: errorMsg });
      toast.error(errorMsg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      <Navbar />

      <div className="flex-1 py-8 px-4 sm:py-12 flex items-center justify-center">
        <div className="container max-w-md mx-auto w-full">
          {!showForgotPassword ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Logo size="lg" className="text-foreground" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Welcome Back
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Sign in to your Farm Fresh Connect account
                </p>
              </div>

              {/* Form Card */}
              <Card className="p-6 sm:p-8 border border-border shadow-lg">
                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-destructive">
                        {errors.submit}
                      </span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInForm.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`pl-10 ${
                          errors.email ? "border-destructive" : ""
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={signInForm.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className={`pl-10 pr-10 ${
                          errors.password ? "border-destructive" : ""
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signInForm.rememberMe}
                      onChange={(e) =>
                        handleInputChange("rememberMe", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-border"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-muted-foreground">
                      Remember me for 30 days
                    </span>
                  </label>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6"
                    variant="harvest"
                    size="lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        className="text-primary font-medium hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                </form>
              </Card>
            </>
          ) : (
            <>
              {/* Forgot Password Card */}
              <Card className="p-6 sm:p-8 border border-border shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setForgotEmail("");
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:underline mb-4 font-medium"
                >
                  ← Back to Sign In
                </button>

                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Reset Your Password
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your email and we'll send you instructions to reset your
                  password.
                </p>

                {!resetEmailSent ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {errors.forgotEmail && (
                      <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-destructive">
                          {errors.forgotEmail}
                        </span>
                      </div>
                    )}

                    <div>
                      <Label
                        htmlFor="reset-email"
                        className="text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            if (errors.forgotEmail) {
                              setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.forgotEmail;
                                return newErrors;
                              });
                            }
                          }}
                          className={`pl-10 ${
                            errors.forgotEmail ? "border-destructive" : ""
                          }`}
                          disabled={resetLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full"
                      variant="harvest"
                    >
                      {resetLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="mb-4">
                      <Mail className="h-12 w-12 text-green-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent password reset instructions to{" "}
                      <span className="font-medium">{forgotEmail}</span>
                    </p>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
