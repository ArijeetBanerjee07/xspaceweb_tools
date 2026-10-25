"use client";

import { useState } from "react";

export function UpgradeButton({
  planId,
  isConfigured,
}: {
  planId: string;
  isConfigured: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!isConfigured) {
      setMessage("Payments are not configured in this environment.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/billing/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle: "monthly" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || data.error || "Failed to initiate subscription");
      } else {
        setMessage(`Order created: ${data.orderId}. Razorpay checkout triggered.`);
      }
    } catch {
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded text-white transition disabled:opacity-50"
      >
        {loading ? "Processing..." : `Upgrade to ${planId.toUpperCase()}`}
      </button>
      {message && (
        <div className="p-2 bg-slate-950 border border-slate-800 text-amber-300 text-xs rounded text-center">
          {message}
        </div>
      )}
    </div>
  );
}
