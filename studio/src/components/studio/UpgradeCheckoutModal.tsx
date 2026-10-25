"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import {
  LuCrown,
  LuCheck,
  LuSparkles,
  LuZap,
  LuShieldCheck,
  LuArrowRight,
  LuX,
  LuBadgePercent,
  LuLoader,
  LuCircleAlert,
} from "react-icons/lu";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightFeature?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function UpgradeCheckoutModal({ isOpen, onClose, highlightFeature }: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSuccess(false);
      setErrorMessage(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load Razorpay script dynamically if not present
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradeClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load secure Razorpay gateway. Please check your internet connection.");
      }

      // 1. Create order on backend
      const res = await fetch("/api/billing/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: "pro",
          billingCycle,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.message || orderData.error || "Failed to initialize checkout order");
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "XSW Tools",
        description: `XSW Tools Pro Subscription (${billingCycle === "yearly" ? "Yearly" : "Monthly"})`,
        image: "/brand/xswtools_logo.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setIsLoading(true);
            // 3. Verify signature on backend
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId: "pro",
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment signature verification failed");
            }

            // Mark Pro in localStorage with 30-day or 365-day expiration & dispatch custom event for immediate UI update
            try {
              localStorage.setItem("otk_is_pro", "true");
              const durationDays = billingCycle === "yearly" ? 365 : 30;
              const durationMs = durationDays * 24 * 60 * 60 * 1000;
              localStorage.setItem("otk_pro_expires_at", String(Date.now() + durationMs));
              window.dispatchEvent(new CustomEvent("otk_plan_updated", { detail: { planId: "pro" } }));
            } catch {
              // safe fallback
            }

            setIsLoading(false);
            setIsSuccess(true);
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // canvas optional
            }
          } catch (err: any) {
            setIsLoading(false);
            setErrorMessage(err?.message || "Verification failed after payment. Please contact support.");
          }
        },
        prefill: {
          name: "XSW Tools User",
          email: "",
        },
        theme: {
          color: "#3bb1df",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        setIsLoading(false);
        setErrorMessage(response.error?.description || "Payment was declined or cancelled.");
      });
      razorpayInstance.open();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || "Failed to start checkout. Please try again.");
    }
  };

  if (!isOpen || !mounted) return null;

  const proPerMonth = billingCycle === "yearly" ? 208 : 299;
  const proBilledTotal = billingCycle === "yearly" ? "₹2,499 / year" : "₹299 / month";

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-[100dvh] min-h-screen bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Ambient background glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-300/15 to-rose-400/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 p-2 rounded-full transition"
          aria-label="Close modal"
        >
          <LuX className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 px-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <LuSparkles className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Welcome to XSW Tools Pro! 🎉
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your workspace has been successfully activated with unlimited document generations, neural AI tools, and full studio features!
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-[#3bb1df] hover:bg-[#259ece] text-white rounded-xl text-sm font-semibold transition shadow-md shadow-[#3bb1df]/25"
              >
                Start Using Pro Features
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wide">
                <LuCrown className="w-3.5 h-3.5 text-amber-500" />
                <span>UPGRADE TO PRO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Supercharge Your Studio Suite
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {highlightFeature ? (
                  <span className="font-semibold text-blue-600">
                    Unlock {highlightFeature} &amp; all other Pro features with zero limits.
                  </span>
                ) : (
                  "Unlock full AI document manipulation, unlimited Office generators, TrendRank AI, and priority queues."
                )}
              </p>

              {/* Billing Cycle Pill Toggle */}
              <div className="pt-2 flex items-center justify-center gap-2">
                <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-xl transition ${
                      billingCycle === "monthly"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      billingCycle === "yearly"
                        ? "bg-[#3bb1df] text-white shadow-sm shadow-[#3bb1df]/25"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>Yearly</span>
                    <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                      SAVE 30%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                <LuCircleAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">Checkout Issue: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Pricing Card & Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch pt-2">
              {/* Highlight Card */}
              <div className="md:col-span-5 rounded-2xl bg-gradient-to-br from-[#1b2a4a] via-[#101b38] to-[#0b1226] text-white p-6 flex flex-col justify-between shadow-lg relative overflow-hidden border border-[#2b3a62]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-blue-300">Pro Plan</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#3bb1df]/20 text-[11px] font-bold text-[#3bb1df] border border-[#3bb1df]/30">Popular</span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tight">₹{proPerMonth}</span>
                      <span className="text-xs text-blue-200 font-medium">/ month</span>
                    </div>
                    <div className="text-[11px] text-blue-300 mt-1">
                      Billed {billingCycle}: {proBilledTotal}
                    </div>
                  </div>
                  <hr className="border-white/10" />
                  <div className="space-y-2 text-xs text-blue-100">
                    <div className="flex items-center gap-2">
                      <LuZap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span>Instant 1-click Razorpay activation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span>Cancel anytime with 1 click</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuBadgePercent className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                      <span>100% money-back guarantee</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleUpgradeClick}
                    className="w-full py-3 bg-gradient-to-r from-[#3bb1df] to-[#259ece] hover:from-[#32a8d6] hover:to-[#1e91be] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#3bb1df]/30 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <LuLoader className="w-4 h-4 animate-spin" />
                        <span>Opening Secure Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>Upgrade to Pro Now</span>
                        <LuArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    Secured by Razorpay &bull; UPI, Cards, NetBanking
                  </p>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="md:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    What&apos;s Included in Pro
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    {[
                      "Unlimited Office Studio creations",
                      "Full TrendRank AI Studio access",
                      "Chat with PDF neural agent",
                      "True cryptographic PDF redaction",
                      "Unlimited PDF encryption & stamps",
                      "Dynamic QR codes & scan tracking",
                      "Product showcase 3D scenes",
                      "Batch processing up to 50 photos",
                      "5 GB cloud storage & custom folders",
                      "Priority 24/7 dedicated support",
                    ].map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <LuCheck className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Questions? Our support team is here to help.</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-600 hover:text-slate-900 font-medium underline"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
