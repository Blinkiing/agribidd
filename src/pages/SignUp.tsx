import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/lib/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    termsAccepted: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !signUpSuccess) {
      const fallback =
        currentUser.accountType === "admin"
          ? "/admin"
          : currentUser.accountType === "seller"
            ? "/seller-dashboard"
            : "/buyer-dashboard";
      navigate(fallback, { replace: true });
    }
  }, [currentUser, navigate, signUpSuccess]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain lowercase letters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase letters";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain numbers";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = "Password must contain special characters (!@#$%^&*)";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!formData.termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("📝 Creating account for:", formData.email);

      await authService.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        accountType: "buyer",
      });

      console.log("✅ Account created successfully");
      setSignUpSuccess(true);
      toast.success("Account created! Check your email to verify.");

      // Redirect after delay
      setTimeout(() => {
        navigate("/buyer-dashboard", { replace: true });
      }, 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Sign up failed";
      console.error("❌ Sign up error:", errorMsg);
      
      // Handle specific error messages
      if (errorMsg.includes("already registered")) {
        setErrors({ email: "This email is already registered" });
        toast.error("Email already registered. Try signing in instead.");
      } else if (errorMsg.includes("password")) {
        setErrors({ password: errorMsg });
        toast.error(errorMsg);
      } else {
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      <Navbar />

      <div className="flex-1 py-8 px-4 sm:py-12 flex items-center justify-center">
        <div className="container max-w-md mx-auto w-full">
          {!signUpSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Logo size="lg" className="text-foreground" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Join Farm Fresh Connect
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Create your account to start shopping fresh
                </p>
              </div>

              {/* Form Card */}
              <Card className="p-6 sm:p-8 border border-border shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className="text-sm text-destructive">
                        {errors.submit}
                      </span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`pl-10 ${
                          errors.name ? "border-destructive" : ""
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

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
                        value={formData.email}
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

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone (Optional)
                    </Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+27 123 456 7890"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a strong password"
                        value={formData.password}
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
                    {formData.password && !errors.password && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Password is strong
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className={`pl-10 pr-10 ${
                          errors.confirmPassword ? "border-destructive" : ""
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) =>
                          handleInputChange("termsAccepted", e.target.checked)
                        }
                        className="w-4 h-4 mt-1 rounded border-border"
                        disabled={isLoading}
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        I agree to the{" "}
                        <a
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-6"
                    variant="harvest"
                    size="lg"
                  >
                    {isLoading ? (
                      "Creating Account..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  {/* Sign In Link */}
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/signin")}
                        className="text-primary font-medium hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              </Card>
            </>
          ) : (
            // Success Message
            <Card className="p-8 text-center border border-border shadow-lg">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Account Created!
              </h2>
              <p className="text-muted-foreground mb-4">
                Check your email inbox to verify your account.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
