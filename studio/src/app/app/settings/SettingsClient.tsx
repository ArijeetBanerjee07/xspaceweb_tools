"use client";

import { useState } from "react";
import { LuCrown, LuCircleAlert, LuCheck, LuSparkles, LuTrash2 } from "react-icons/lu";
import { useProStatus } from "@/lib/gating";

export function SettingsClient({
  initialName,
  initialWorkspaceName,
  email,
  planId,
}: {
  initialName: string;
  initialWorkspaceName: string;
  email: string;
  planId?: string;
}) {
  const isPro = useProStatus(planId);
  const [name, setName] = useState(initialName);
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Cancellation State
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setSubscriptionMessage(null);
    setSubscriptionError(null);

    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to cancel subscription");
      }

      try {
        localStorage.removeItem("otk_is_pro");
        localStorage.removeItem("otk_pro_expires_at");
        window.dispatchEvent(new CustomEvent("otk_plan_updated", { detail: { planId: "free" } }));
      } catch {
        // safe fallback
      }

      setSubscriptionMessage("Your Pro subscription has been cancelled. Your workspace has been returned to the Free tier.");
      setIsConfirmingCancel(false);
    } catch (err: any) {
      setSubscriptionError(err?.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, workspaceName }),
      });
      if (res.ok) {
        setProfileMessage("Profile and workspace updated successfully.");
      } else {
        setProfileMessage("Failed to update profile.");
      }
    } catch {
      setProfileMessage("An unexpected error occurred.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);
    setPasswordError(null);

    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordError(data.error || "Failed to update password.");
      }
    } catch {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile & Workspace */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Profile &amp; Workspace</h2>

        {profileMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            {profileMessage}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={email}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-xl text-white transition disabled:opacity-50 shadow-xs"
          >
            {profileLoading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Change Password</h2>

        {passwordMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-xl text-white transition disabled:opacity-50 shadow-xs"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Subscription & Plan Management */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LuCrown className="w-5 h-5 text-amber-500" />
            <span>Subscription &amp; Plan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your billing status, studio access tier, and subscription cancellation.
          </p>
        </div>

        {subscriptionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{subscriptionMessage}</span>
          </div>
        )}

        {subscriptionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
            <LuCircleAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{subscriptionError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">Current Status:</span>
              {isPro ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-2xs">
                  PRO ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  FREE TIER
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {isPro
                ? "Full access to all 9 studios, neural AI engines, unlimited document generations, and 500 GB cloud storage."
                : "Standard free allowances with studio quota limits. Upgrade anytime for unlimited access."}
            </p>
          </div>

          {isPro && !isConfirmingCancel && (
            <button
              type="button"
              onClick={() => setIsConfirmingCancel(true)}
              className="px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-semibold rounded-xl transition shadow-2xs shrink-0 flex items-center gap-1.5"
            >
              <span>Cancel Pro Subscription</span>
            </button>
          )}
        </div>

        {isConfirmingCancel && (
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5 text-rose-900">
              <LuCircleAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold">Are you sure you want to cancel your Pro subscription?</div>
                <div className="text-xs text-rose-700 leading-relaxed">
                  Your workspace will immediately return to the Free tier. Pro-exclusive tools (TrendRank AI, True Redaction, Custom Overlays) will be locked, and Office Studio generations will be capped at 3 per tool.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 text-center"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel Subscription"}
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={() => setIsConfirmingCancel(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition text-center"
              >
                Keep My Pro Subscription
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
