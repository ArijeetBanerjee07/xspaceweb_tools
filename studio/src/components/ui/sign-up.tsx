"use client";

import React, { useState, useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader,
  Zap,
  ShieldCheck,
  Cloud,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

// --- GOOGLE BRAND ICON ---
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

// --- LEFT PANEL BACKGROUND IMAGE ---
const LeftHeroArtwork = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
    <img
      src="/auth-bg.png"
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
    />
  </div>
);

// --- COMPONENT PROPS ---
export interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
  onSuccess?: () => void;
  initialMode?: "signin" | "signup";
}

export const AuthComponent = ({
  brandName = "XSWTOOLS",
  onSuccess,
  initialMode = "signin",
}: AuthComponentProps) => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [featureParam, setFeatureParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setFeatureParam(params.get("feature"));
    }
  }, []);

  const usernameInputId = useId();
  const passwordInputId = useId();
  const confirmPasswordInputId = useId();
  const rememberMeId = useId();
  const termsCheckboxId = useId();

  // Password criteria for sign-up
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordStrong = hasMinLength && hasNumber && hasSpecial;

  const fireSuccessConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch {}
  };

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setErrorMessage("");
    // Update browser URL query or history cleanly
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newMode === "signup" ? "/signup" : "/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setErrorMessage("Please enter a username.");
      return;
    }

    if (trimmedUser.length < 3) {
      setErrorMessage("Username must be at least 3 characters.");
      return;
    }

    if (/\s/.test(trimmedUser)) {
      setErrorMessage("Username cannot contain spaces.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      if (!isPasswordStrong) {
        setErrorMessage("Please make sure your password satisfies all 3 security requirements.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please re-enter.");
        return;
      }

      if (!agreeTerms) {
        setErrorMessage("Please agree to the Terms of Service and Privacy Policy to create an account.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: trimmedUser,
            password,
            confirmPassword,
          }),
        });

        const data = await signupRes.json();

        if (signupRes.status === 409) {
          setErrorMessage("This username is already taken. Please choose another or sign in.");
          setIsSubmitting(false);
          return;
        }

        if (!signupRes.ok) {
          setErrorMessage(data.message || data.error || "Failed to create account. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Successfully registered! Directly sign in via NextAuth and navigate to dashboard
        const loginRes = await signIn("credentials", {
          username: trimmedUser,
          password,
          redirect: false,
          callbackUrl: "/app",
        });

        if (loginRes?.error) {
          setErrorMessage("Account created! Please sign in using your credentials.");
          setIsSubmitting(false);
          handleModeSwitch("signin");
          return;
        }

        fireSuccessConfetti();
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = "/app";
          }
        }, 400);
      } catch (err: any) {
        setErrorMessage(err?.message || "Registration failed. Please try again.");
        setIsSubmitting(false);
      }
    } else {
      // Sign-in flow
      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const res = await signIn("credentials", {
          username: trimmedUser,
          password,
          redirect: false,
          callbackUrl: "/app",
        });

        if (!res || res.error) {
          setErrorMessage("Invalid username or password. Please verify your credentials or create an account.");
          setIsSubmitting(false);
          return;
        }

        fireSuccessConfetti();
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            const params = new URLSearchParams(window.location.search);
            const destination = params.get("callbackUrl") || "/app";
            window.location.href = destination;
          }
        }, 400);
      } catch (err: any) {
        setErrorMessage(err?.message || "Failed to sign in. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-2 bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ================= LEFT HERO PANEL ================= */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-slate-100">
        <LeftHeroArtwork />

        {/* Top Brand Logo & Label */}
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="XSWTOOLS"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              xsw<span className="text-[#3bb1df]">tools</span>
            </span>
          </Link>
        </div>

        {/* Feature Showcase shifted upward */}
        <div className="relative z-10 max-w-lg my-auto pt-6 pb-2">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            All Your Tools, In One Workspace
          </h2>
          <p className="text-sm xl:text-base text-slate-600 mt-2 leading-relaxed">
            Create, convert, edit, optimize and automate — with powerful online tools for everyone.
          </p>

          <div className="mt-6 space-y-3">
            {/* Feature 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/50 backdrop-blur-xs border border-white/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 fill-blue-600 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">9 Powerful Studios</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">PDF, AI, Image, Office, QR, and more.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/50 backdrop-blur-xs border border-white/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Secure & Private</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Your files are safe. No data is stored.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/50 backdrop-blur-xs border border-white/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Work Anywhere</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Access all tools from any device.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT FORM PANEL ================= */}
      <div className="relative flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-white overflow-y-auto">
        {/* Top Row Switcher */}
        <div className="flex items-center justify-between lg:justify-end w-full mb-4">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border border-blue-100 flex items-center justify-center p-1 shadow-2xs">
              <img
                src="/logo.png"
                alt="XSWTOOLS"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-black text-base text-slate-900">
              xsw<span className="text-[#3bb1df]">tools</span>
            </span>
          </div>

          {mode === "signup" ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => handleModeSwitch("signin")}
                className="px-3.5 py-1.5 font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl border border-blue-100 transition cursor-pointer"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <span>New to {brandName}?</span>
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className="px-3.5 py-1.5 font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl border border-blue-100 transition cursor-pointer"
              >
                Create an Account
              </button>
            </div>
          )}
        </div>

        {/* Center Main Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-2">
          {/* Brand & Heading */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100/90 flex items-center justify-center p-2 mb-1.5 shadow-2xs">
              <img
                src="/logo.png"
                alt="XSWTOOLS"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 mb-1">
              XSWTOOLS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {mode === "signin" ? "Welcome Back" : "Create Your Account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === "signin"
                ? "Sign in to access all 9 studios and continue your work."
                : "Get started with all 9 studios and unlock powerful tools."}
            </p>

            {featureParam && (
              <div className="mt-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/80 text-xs text-pink-900 flex items-center justify-center gap-2 shadow-2xs">
                <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
                <span>
                  Sign up to unlock <strong>{featureParam === "ai-summarizer" ? "AI Summarizer" : featureParam.replace(/-/g, " ")}</strong> and all Pro AI features
                </span>
              </div>
            )}
          </div>

          {/* Google Auth Button (Microsoft completely removed per instruction) */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => {
                const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
                const destination = params?.get("callbackUrl") || params?.get("redirect") || "/app";
                signIn("google", { callbackUrl: destination });
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50/80 active:scale-[0.99] font-medium text-sm text-slate-700 transition shadow-2xs cursor-pointer"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              OR
            </span>
          </div>

          {/* Alert Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USERNAME */}
            <div>
              <label
                htmlFor={usernameInputId}
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id={usernameInputId}
                  type="text"
                  required
                  placeholder={mode === "signup" ? "Choose a username (e.g. alex_dev)" : "Enter your username"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 transition bg-white"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor={passwordInputId}
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id={passwordInputId}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 transition bg-white"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword((prev) => !prev);
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Sign-up only) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor={confirmPasswordInputId}
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id={confirmPasswordInputId}
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-slate-900 transition bg-white"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowConfirmPassword((prev) => !prev);
                    }}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 pointer-events-none" /> : <Eye className="w-4 h-4 pointer-events-none" />}
                  </button>
                </div>
              </div>
            )}

            {/* SIGN-UP PASSWORD CHECKLIST */}
            {mode === "signup" && (
              <div className="space-y-1.5 pt-1 text-xs text-slate-500">
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasMinLength ? "text-emerald-600 font-medium" : "text-slate-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasNumber ? "text-emerald-600 font-medium" : "text-slate-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Include a number</span>
                </div>
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasSpecial ? "text-emerald-600 font-medium" : "text-slate-400"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Include a special character</span>
                </div>
              </div>
            )}

            {/* SIGN-UP TERMS CHECKBOX */}
            {mode === "signup" && (
              <div className="pt-2">
                <label
                  htmlFor={termsCheckboxId}
                  className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none"
                >
                  <input
                    id={termsCheckboxId}
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/privacy" className="text-blue-600 font-medium hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 font-medium hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>
            )}

            {/* SIGN-IN REMEMBER ME & FORGOT PASSWORD */}
            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label
                  htmlFor={rememberMeId}
                  className="flex items-center gap-2 text-slate-600 cursor-pointer select-none"
                >
                  <input
                    id={rememberMeId}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition shadow-md shadow-blue-600/25 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create an Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-8 text-center text-xs text-slate-500">
            {mode === "signin" ? (
              <span>
                New to XSWTOOLS?{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signup")}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer ml-0.5"
                >
                  Create an Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signin")}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer ml-0.5"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 mt-6">
          © {new Date().getFullYear()} XSW Tools. All rights reserved.
        </div>
      </div>
    </div>
  );
};
