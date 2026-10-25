"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProStatus } from "@/lib/gating";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import {
  LuCrown,
  LuCalendar,
  LuClock,
  LuDownload,
  LuCheck,
  LuSparkles,
  LuFileText,
  LuShieldCheck,
} from "react-icons/lu";

interface UsageClientProps {
  initialIsPro: boolean;
  workspaceName: string;
  initialEndDate: string | null;
  initialDaysRemaining: number | null;
  usage: {
    imageCredits: number;
    aiCredits: number;
    qrCodes: number;
  };
  isRazorpayConfigured: boolean;
  subscriptionCreatedAt: string | null;
}

export function UsageClient({
  initialIsPro,
  workspaceName,
  initialEndDate,
  initialDaysRemaining,
  usage,
  isRazorpayConfigured,
  subscriptionCreatedAt,
}: UsageClientProps) {
  const clientIsPro = useProStatus();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<"monthly" | "yearly">("monthly");
  const [endDateStr, setEndDateStr] = useState<string | null>(initialEndDate);
  const [daysLeft, setDaysLeft] = useState<number | null>(initialDaysRemaining);

  const isPro = initialIsPro || clientIsPro;

  useEffect(() => {
    if (isPro && !endDateStr) {
      try {
        const storedExpires = localStorage.getItem("otk_pro_expires_at");
        if (storedExpires) {
          const expDate = new Date(parseInt(storedExpires, 10));
          if (!isNaN(expDate.getTime())) {
            setEndDateStr(
              expDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            );
            const diffMs = expDate.getTime() - Date.now();
            setDaysLeft(Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))));
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // Default fallback if subscription exists but date not calculated
      const fallbackEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      setEndDateStr(
        fallbackEnd.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
      setDaysLeft(30);
    }
  }, [isPro, endDateStr]);

  const displayPlans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      period: "/mo",
      description: "Standard free allowances with studio quota limits",
      features: [
        "25 MB max file upload",
        "50 pages / document",
        "Core conversions & page ops 100% free",
        "5 Watermark runs & 3 Encrypt runs",
        "3 Office Studio generations per tool",
        "1 GB Cloud Storage",
      ],
      isCurrent: !isPro,
    },
    {
      id: "pro_monthly",
      name: "Pro (Monthly)",
      price: "₹299",
      period: "/mo",
      description: "Complete studio suite with unlimited neural generation",
      features: [
        "100 MB max file upload",
        "500 pages / document",
        "All 9 Studios 100% Unlocked",
        "Unlimited Office Studio generations",
        "TrendRank AI Studio (Full Access)",
        "500 GB Cloud Storage",
      ],
      isCurrent: isPro,
      isPopular: true,
      cycle: "monthly" as const,
    },
    {
      id: "pro_yearly",
      name: "Pro (Yearly)",
      price: "₹2,499",
      period: "/year",
      subprice: "₹208 / month (Save 30%)",
      description: "Annual priority pass with best value discount",
      features: [
        "Everything in Pro Monthly",
        "Save 30% over monthly billing",
        "Priority VIP queue processing",
        "Unlimited batch processing",
        "500 GB Cloud Storage",
        "Early access to neural beta tools",
      ],
      isCurrent: false,
      cycle: "yearly" as const,
    },
  ];

  const handleOpenUpgrade = (cycle: "monthly" | "yearly") => {
    setSelectedCycle(cycle);
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usage &amp; Plans</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your plan limits, monthly billing details, active subscription end date, and invoices.
        </p>
      </div>

      {/* Active Plan Overview */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 shadow-xs ${
          isPro
            ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-amber-400/40 shadow-xl"
            : "bg-white border-slate-200/80 text-slate-900"
        }`}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isPro ? "text-amber-300" : "text-slate-400"
                }`}
              >
                Active Subscription
              </span>
              {isPro ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-2xs">
                  <LuCrown className="w-3.5 h-3.5" />
                  PRO ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  FREE TIER
                </span>
              )}
            </div>

            <div className="text-3xl font-extrabold flex items-baseline gap-2">
              <span>{isPro ? "Pro Plan" : "Free Plan"}</span>
              <span className={`text-base font-semibold ${isPro ? "text-blue-300" : "text-blue-600"}`}>
                {isPro ? "(₹299/mo)" : "(₹0/mo)"}
              </span>
            </div>

            <p className={`text-xs leading-relaxed max-w-xl ${isPro ? "text-slate-300" : "text-slate-500"}`}>
              {isPro
                ? "Full unlimited operations across all 9 studios, neural AI engines, 500 GB cloud space, and priority queue dispatch."
                : "Workspace storage: 1 GB • Max file: 25 MB • Standard quota limits apply."}
            </p>
          </div>

          {/* End Date & Expiry Badge */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 shrink-0 min-w-[260px] ${
              isPro
                ? "bg-white/10 backdrop-blur-md border-white/15 text-white"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <LuCalendar className="w-4 h-4 text-amber-400" />
                <span>Subscription End Date</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Active
              </span>
            </div>

            <div className="text-lg font-bold text-emerald-300">
              {isPro ? endDateStr || "November 23, 2026" : "Continuous Free Tier"}
            </div>

            {isPro && daysLeft !== null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <LuClock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <span>
                  <strong>{daysLeft} days</strong> remaining in this billing cycle
                </span>
              </div>
            )}

            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
              Workspace: <strong>{workspaceName}</strong>
            </div>
          </div>
        </div>

        {/* Meters */}
        <div
          className={`mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t ${
            isPro ? "border-white/10 text-white" : "border-slate-100 text-slate-800"
          }`}
        >
          <div>
            <div className={`text-xs ${isPro ? "text-slate-400" : "text-slate-500"}`}>Image Processing</div>
            <div className="text-lg font-bold mt-1">
              {isPro ? "Unlimited" : `${usage.imageCredits} / 5`}
            </div>
          </div>
          <div>
            <div className={`text-xs ${isPro ? "text-slate-400" : "text-slate-500"}`}>AI Neural Credits</div>
            <div className="text-lg font-bold mt-1">
              {isPro ? "75 / 75 Monthly" : `${usage.aiCredits} / 5`}
            </div>
          </div>
          <div>
            <div className={`text-xs ${isPro ? "text-slate-400" : "text-slate-500"}`}>QR &amp; Dynamic Links</div>
            <div className="text-lg font-bold mt-1">
              {isPro ? "Unlimited" : `${usage.qrCodes} / 20`}
            </div>
          </div>
          <div>
            <div className={`text-xs ${isPro ? "text-slate-400" : "text-slate-500"}`}>Office Generations</div>
            <div className="text-lg font-bold mt-1">
              {isPro ? "Unlimited (All 7 Engines)" : "3 per Tool"}
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Available Plans</h2>
          <p className="text-xs text-slate-500">Transparent pricing. No hidden fees. Cancel anytime in Settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayPlans.map((p) => {
            return (
              <div
                key={p.id}
                className={`bg-white border rounded-3xl p-6 flex flex-col justify-between shadow-xs transition relative ${
                  p.isCurrent
                    ? "border-blue-600 ring-2 ring-blue-100 shadow-md"
                    : p.isPopular
                    ? "border-[#3bb1df] ring-1 ring-[#3bb1df]/20"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-base">{p.name}</span>
                    {p.isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                        CURRENT PLAN
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                      <span className="text-xs text-slate-500 font-medium">{p.period}</span>
                    </div>
                    {p.subprice && (
                      <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                        {p.subprice}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1.5">{p.description}</p>
                  </div>

                  <hr className="border-slate-100" />

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <LuCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  {p.isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <LuCheck className="w-3.5 h-3.5" />
                      <span>Current Active Plan</span>
                    </button>
                  ) : p.id === "free" ? (
                    <Link
                      href="/app/settings"
                      className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl text-center block transition"
                    >
                      Downgrade to Free
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleOpenUpgrade(p.cycle || "monthly")}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Upgrade to {p.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuFileText className="w-4 h-4 text-blue-600" />
              <span>Invoice &amp; Payment History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Download itemized tax receipts and proof of purchase documents for your subscriptions.
            </p>
          </div>
        </div>

        {isPro || subscriptionCreatedAt ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Invoice #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70 transition">
                  <td className="py-4 pl-2 font-mono font-bold text-slate-800">INV-2026-001</td>
                  <td className="py-4 text-slate-600">
                    {new Date(subscriptionCreatedAt || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 font-semibold text-slate-900">
                    Omni Tool Kit Pro (Monthly Subscription)
                  </td>
                  <td className="py-4 font-bold text-slate-900">₹299.00</td>
                  <td className="py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      PAID IN FULL
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <a
                      href="/api/billing/invoice?id=INV-2026-001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition shadow-2xs"
                    >
                      <LuDownload className="w-3.5 h-3.5" />
                      <span>Download Invoice</span>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            No invoices generated yet for this workspace. Invoices will appear here once a billing cycle closes.
          </div>
        )}
      </div>

      <UpgradeCheckoutModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
