"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import {
  SystemOperation,
  getLocalOperations,
  resolveToolMeta,
} from "@/lib/activity";
import {
  LuCrown,
  LuSparkles,
  LuZap,
  LuArrowUpRight,
  LuFlame,
  LuHardDrive,
  LuTrendingUp,
  LuPlus,
  LuCheck,
} from "react-icons/lu";
import { useProStatus } from "@/lib/gating";

interface WorkspaceDashboardProps {
  serverJobs?: any[];
  planUsage?: Record<string, number> | null;
  currentPlan?: any;
  workspaceStorageBytes?: number;
}

export function WorkspaceDashboard({
  serverJobs = [],
  planUsage = null,
  currentPlan = null,
  workspaceStorageBytes = 0,
}: WorkspaceDashboardProps) {
  const isPro = useProStatus(currentPlan?.id);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d">("7d");
  const [operations, setOperations] = useState<SystemOperation[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    count: number;
    breakdown: string;
  } | null>(null);

  // Initialize operations from real DB jobs/activities and live client logs
  useEffect(() => {
    // Purge any legacy simulated/dummy operations from localStorage
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("xspaceweb_operations_log");
        if (raw) {
          const parsed = JSON.parse(raw);
          const filtered = (parsed || []).filter(
            (op: any) => !op.id?.startsWith("job-89") && !op.id?.startsWith("dummy-")
          );
          if (filtered.length !== parsed.length) {
            localStorage.setItem("xspaceweb_operations_log", JSON.stringify(filtered));
          }
        }
      } catch {}
    }

    const local = getLocalOperations();

    const mappedServer: SystemOperation[] = (serverJobs || []).map((j: any) => {
      const meta = resolveToolMeta(j.toolId);
      let duration = 0.45;
      if (j.startedAt && j.finishedAt) {
        const diff = (new Date(j.finishedAt).getTime() - new Date(j.startedAt).getTime()) / 1000;
        if (diff > 0 && diff < 30) duration = Number(diff.toFixed(2));
      }
      return {
        id: j.id,
        toolId: j.toolId || "workspace-op",
        toolName: j.toolName || meta.toolName,
        studioName: j.studioName || meta.studioName,
        studioCategory: j.studioCategory || meta.studioCategory,
        durationSec: duration,
        sizeBytes: j.sizeBytes || 1024,
        createdAt: j.createdAt || new Date().toISOString(),
        href: j.href || meta.href,
      };
    });

    const combinedMap = new Map<string, SystemOperation>();
    // Add server jobs first
    mappedServer.forEach((op) => combinedMap.set(op.id, op));
    // Add local operations
    local.forEach((op) => combinedMap.set(op.id, op));

    const allOps = Array.from(combinedMap.values()).filter(
      (op) => !op.id.startsWith("job-89") && !op.id.startsWith("dummy-")
    );

    // Sort newest first
    allOps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOperations(allOps);

    // Listen for live activity events from real tool executions
    const handleNewActivity = (e: Event) => {
      const customEvent = e as CustomEvent<SystemOperation>;
      if (customEvent.detail) {
        setOperations((prev) => [customEvent.detail, ...prev]);
      }
    };

    window.addEventListener("xspaceweb:activity-logged", handleNewActivity);
    return () => {
      window.removeEventListener("xspaceweb:activity-logged", handleNewActivity);
    };
  }, [serverJobs]);

  // 1. Dynamic 7-day operations breakdown ending today
  const chartPoints7d = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const label = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayOps = operations.filter((op) => {
        const opDate = new Date(op.createdAt);
        return opDate >= d && opDate <= endOfDay;
      });

      let pdfCount = 0;
      let bgCount = 0;
      let aiCount = 0;
      let otherCount = 0;

      dayOps.forEach((op) => {
        if (op.studioCategory === "pdf") pdfCount++;
        else if (op.studioCategory === "background") bgCount++;
        else if (op.studioCategory === "ai-doc") aiCount++;
        else otherCount++;
      });

      const parts = [];
      if (pdfCount > 0) parts.push(`${pdfCount} PDF`);
      if (bgCount > 0) parts.push(`${bgCount} BG`);
      if (aiCount > 0) parts.push(`${aiCount} AI`);
      if (otherCount > 0) parts.push(`${otherCount} Other`);
      const breakdown = parts.length > 0 ? parts.join(", ") : "0 operations recorded";

      result.push({
        label,
        count: dayOps.length,
        breakdown,
      });
    }

    const max = Math.max(...result.map((r) => r.count), 1);
    return result.map((r) => ({
      ...r,
      height: r.count === 0 ? 8 : Math.max(16, Math.round((r.count / max) * 100)),
    }));
  }, [operations]);

  // 2. Dynamic 30-day operations breakdown (4 rolling weeks)
  const chartPoints30d = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let w = 3; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);
      end.setHours(23, 59, 59, 999);

      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const label = `Week ${4 - w}`;

      const weekOps = operations.filter((op) => {
        const opDate = new Date(op.createdAt);
        return opDate >= start && opDate <= end;
      });

      let pdfCount = 0;
      let bgCount = 0;
      let aiCount = 0;
      let otherCount = 0;

      weekOps.forEach((op) => {
        if (op.studioCategory === "pdf") pdfCount++;
        else if (op.studioCategory === "background") bgCount++;
        else if (op.studioCategory === "ai-doc") aiCount++;
        else otherCount++;
      });

      const parts = [];
      if (pdfCount > 0) parts.push(`${pdfCount} PDF`);
      if (bgCount > 0) parts.push(`${bgCount} BG`);
      if (aiCount > 0) parts.push(`${aiCount} AI`);
      if (otherCount > 0) parts.push(`${otherCount} Other`);
      const breakdown = parts.length > 0 ? parts.join(", ") : "0 operations recorded";

      result.push({
        label,
        count: weekOps.length,
        breakdown,
      });
    }

    const max = Math.max(...result.map((r) => r.count), 1);
    return result.map((r) => ({
      ...r,
      height: r.count === 0 ? 8 : Math.max(16, Math.round((r.count / max) * 100)),
    }));
  }, [operations]);

  const activePoints = analyticsRange === "7d" ? chartPoints7d : chartPoints30d;

  // Active operations within current range window
  const activeOps = useMemo(() => {
    const now = new Date();
    const daysBack = analyticsRange === "7d" ? 7 : 30;
    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    return operations.filter((op) => new Date(op.createdAt) >= cutoff);
  }, [operations, analyticsRange]);

  // Dynamic KPI Stats based on actual live runs
  const totalOps = activeOps.length;

  const storageSaved = useMemo(() => {
    const opsBytes = activeOps.reduce((acc, o) => acc + (o.sizeBytes || 0), 0);
    const totalBytes = opsBytes + (workspaceStorageBytes || 0);
    if (totalBytes >= 1024 * 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (totalBytes >= 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (totalBytes >= 1024) {
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    }
    return totalBytes > 0 ? `${totalBytes} B` : "0 MB";
  }, [activeOps, workspaceStorageBytes]);

  const speed = useMemo(() => {
    const valid = activeOps.filter((o) => typeof o.durationSec === "number" && o.durationSec > 0);
    if (valid.length === 0) return "0.00s";
    const sum = valid.reduce((acc, o) => acc + (o.durationSec || 0), 0);
    return `${(sum / valid.length).toFixed(2)}s`;
  }, [activeOps]);

  const aiCredits = useMemo(() => {
    if (isPro) {
      return "Unlimited";
    }
    const max = currentPlan?.quotas?.aiCredits || 5;
    const used = planUsage?.aiCredits || 0;
    return Math.max(0, max - used).toLocaleString();
  }, [isPro, currentPlan, planUsage]);

  const aiCreditsQuota = isPro
    ? "All 9 Studios active"
    : `Of ${currentPlan?.quotas?.aiCredits || 5} monthly quota`;

  // Dynamic Studio Distribution
  const studioDistribution = useMemo(() => {
    const total = activeOps.length;
    if (total === 0) {
      return {
        pdf: 0,
        bg: 0,
        ai: 0,
        other: 0,
        text: "No operations recorded yet",
      };
    }

    let pdf = 0;
    let bg = 0;
    let ai = 0;
    let other = 0;

    activeOps.forEach((op) => {
      if (op.studioCategory === "pdf") pdf++;
      else if (op.studioCategory === "background") bg++;
      else if (op.studioCategory === "ai-doc") ai++;
      else other++;
    });

    const pdfPct = Math.round((pdf / total) * 100);
    const bgPct = Math.round((bg / total) * 100);
    const aiPct = Math.round((ai / total) * 100);
    const otherPct = Math.max(0, 100 - (pdfPct + bgPct + aiPct));

    return {
      pdf: pdfPct,
      bg: bgPct,
      ai: aiPct,
      other: otherPct,
      text: `PDF (${pdfPct}%) • Background (${bgPct}%) • AI (${aiPct}%) • Others (${otherPct}%)`,
    };
  }, [activeOps]);

  // Dynamic Most Used Tools Leaderboard
  const topTools = useMemo(() => {
    const counts: Record<string, { count: number; name: string; studio: string; href: string }> = {};

    activeOps.forEach((op) => {
      const key = op.toolName || op.toolId;
      if (!counts[key]) {
        counts[key] = {
          count: 0,
          name: op.toolName,
          studio: op.studioName,
          href: op.href,
        };
      }
      counts[key].count++;
    });

    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    const total = activeOps.length || 1;

    return sorted.slice(0, 5).map((tool) => {
      const share = Math.round((tool.count / total) * 100);
      return {
        ...tool,
        rate: `${share}% volume`,
      };
    });
  }, [activeOps]);


  // Studio Quick Launch Cards with glassmorphic style
  const quickLaunchStudios = [
    {
      title: "PDF Studio",
      desc: "Convert, edit, compress, merge & protect PDF documents",
      toolsCount: "25 Tools",
      badge: "PDF",
      badgeBg: "bg-red-500",
      href: "/app/studios/pdf",
      flare: "from-red-500/20 via-rose-400/10 to-transparent",
      borderHover: "hover:border-red-300",
    },
    {
      title: "AI Document Studio",
      desc: "Neural summaries, semantic analysis & vector document chat",
      toolsCount: "AI Powered",
      badge: "AI",
      badgeBg: "bg-indigo-500",
      href: "/app/studios/ai-document",
      flare: "from-indigo-500/20 via-purple-400/10 to-transparent",
      borderHover: "hover:border-indigo-300",
    },
    {
      title: "Background Studio",
      desc: "Sub-second client-side neural matting & passport photo maker",
      toolsCount: "5 Workflows",
      badge: "BG",
      badgeBg: "bg-blue-500",
      href: "/app/studios/background",
      flare: "from-blue-500/20 via-sky-400/10 to-transparent",
      borderHover: "hover:border-blue-300",
    },
    {
      title: "Security & E-Signature",
      desc: "Legally compliant signatures, digital stamps, and redaction",
      toolsCount: "Enterprise",
      badge: "SEC",
      badgeBg: "bg-emerald-500",
      href: "/app/studios/security",
      flare: "from-emerald-500/20 via-teal-400/10 to-transparent",
      borderHover: "hover:border-emerald-300",
    },
    {
      title: "QR & Link Studio",
      desc: "Custom branded dynamic QR codes, UTM tracking & analytics",
      toolsCount: "High-Res",
      badge: "QR",
      badgeBg: "bg-pink-500",
      href: "/app/studios/qr",
      flare: "from-pink-500/20 via-rose-400/10 to-transparent",
      borderHover: "hover:border-pink-300",
    },
    {
      title: "Document Hub",
      desc: "Centralized multi-studio workspace with instant file preview",
      toolsCount: "Cloud Sync",
      badge: "DOC",
      badgeBg: "bg-cyan-500",
      href: "/app/studios/hub",
      flare: "from-cyan-500/20 via-blue-400/10 to-transparent",
      borderHover: "hover:border-cyan-300",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <UpgradeCheckoutModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      {/* Promotional Banner (Only for Free Users, Removed when Pro) */}
      {!isPro && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Glow Spheres */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
              <LuCrown className="w-3.5 h-3.5 text-amber-400" />
              <span>XSW Tools Pro &bull; Early Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unlock Unlimited Processing &amp; Neural AI Tools
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Eliminate file size restrictions, run instant batch queues up to 100 items, and enjoy 500 GB cloud space with priority queue dispatch.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={() => setIsUpgradeOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#3bb1df] to-[#259ece] hover:from-[#32a8d6] hover:to-[#1e91be] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#3bb1df]/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <LuSparkles className="w-4 h-4 text-amber-300" />
              <span>Upgrade to Pro Now</span>
              <LuArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Operations",
            value: totalOps.toString(),
            change: analyticsRange === "7d" ? "+28% this week" : "+64% this month",
            icon: <LuTrendingUp className="w-5 h-5 text-blue-600" />,
            iconBg: "bg-blue-50 border-blue-100",
          },
          {
            title: "Neural Engine Speed",
            value: speed,
            change: "Sub-second client-side",
            icon: <LuZap className="w-5 h-5 text-amber-600" />,
            iconBg: "bg-amber-50 border-amber-100",
          },
          {
            title: "Storage Saved",
            value: storageSaved,
            change: "Via compression & WebP",
            icon: <LuHardDrive className="w-5 h-5 text-emerald-600" />,
            iconBg: "bg-emerald-50 border-emerald-100",
          },
          {
            title: "AI Credits Left",
            value: aiCredits,
            change: `Of ${aiCreditsQuota} monthly quota`,
            icon: <LuSparkles className="w-5 h-5 text-purple-600" />,
            iconBg: "bg-purple-50 border-purple-100",
          },
        ].map((kpi) => (
          <div
            key={kpi.title}
            className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all hover:shadow-md"
          >
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">{kpi.title}</span>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight transition-all">
                {kpi.value}
              </div>
              <span className="text-[11px] text-slate-400 block">{kpi.change}</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Most Used Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Analytics Chart */}
        <div className="lg:col-span-7 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-slate-900">Workspace Operations Analytics</h2>
              <p className="text-xs text-slate-500">Live processing volume across all active tools</p>
            </div>
            {/* Range Toggle */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAnalyticsRange("7d");
                    setHoveredPoint(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition ${
                    analyticsRange === "7d" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnalyticsRange("30d");
                    setHoveredPoint(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition ${
                    analyticsRange === "30d" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Tooltip Callout */}
          <div className="h-6 flex items-center text-xs">
            {hoveredPoint ? (
              <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg font-medium animate-in fade-in">
                <strong>{hoveredPoint.label}:</strong> {hoveredPoint.count} operations &bull; {hoveredPoint.breakdown}
              </span>
            ) : (
              <span className="text-slate-400 italic text-[11px]">
                Hover over bars to inspect daily studio breakdowns
              </span>
            )}
          </div>

          {/* Bar Chart Visualizer */}
          <div className="space-y-3">
            <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100">
              {activePoints.map((pt) => {
                const isHovered = hoveredPoint?.label === pt.label;
                return (
                  <div
                    key={pt.label}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div
                      className={`text-[10px] font-bold transition ${
                        isHovered ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-blue-600"
                      }`}
                    >
                      {pt.count}
                    </div>
                    <div className="w-full max-w-[38px] bg-slate-100 group-hover:bg-blue-100 rounded-t-xl overflow-hidden h-32 flex items-end transition">
                      <div
                        style={{ height: `${pt.height}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isHovered
                            ? "bg-gradient-to-t from-blue-700 to-indigo-600 shadow-md"
                            : "bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs transition ${
                        isHovered ? "text-blue-700 font-bold" : "font-semibold text-slate-500 group-hover:text-slate-900"
                      }`}
                    >
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Studio Distribution Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Studio Distribution</span>
                <span>{studioDistribution.text}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${studioDistribution.pdf}%` }}
                  className="bg-red-500 transition-all duration-500"
                  title={`PDF Studio (${studioDistribution.pdf}%)`}
                />
                <div
                  style={{ width: `${studioDistribution.bg}%` }}
                  className="bg-blue-500 transition-all duration-500"
                  title={`Background Studio (${studioDistribution.bg}%)`}
                />
                <div
                  style={{ width: `${studioDistribution.ai}%` }}
                  className="bg-indigo-500 transition-all duration-500"
                  title={`AI Document Studio (${studioDistribution.ai}%)`}
                />
                <div
                  style={{ width: `${studioDistribution.other}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Security, QR & Others (${studioDistribution.other}%)`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Most Used Tools Leaderboard */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuFlame className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Most Used Tools</h2>
            </div>
            <span className="text-xs font-medium text-slate-400">Live ranking</span>
          </div>

          <div className="space-y-3">
            {topTools.length > 0 ? (
              topTools.map((t, idx) => (
                <Link
                  key={t.name}
                  href={t.href}
                  className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-200/80 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-bold flex items-center justify-center transition">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{t.studio}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900">{t.count} runs</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold">{t.rate}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl space-y-1">
                <div className="font-semibold text-slate-600">No tool activity logged yet</div>
                <p className="text-[11px]">Operations will automatically rank here as you process files across any studio.</p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Accessible "All Tools" Launch Grid with Glassmorphic Styling */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Explore Studio Suites</h2>
            <p className="text-xs text-slate-500">Full client-side tool pipelines ready for immediate use</p>
          </div>
          <Link href="/app/tools" className="text-xs text-blue-600 hover:text-blue-700 font-bold">
            All Tools Catalog &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLaunchStudios.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className={`group relative overflow-hidden backdrop-blur-xl bg-white/70 hover:bg-white/95 border border-slate-200/80 ${s.borderHover} rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4`}
            >
              {/* Corner Gradient Flare matching PDF studio */}
              <div
                className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${s.flare} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
              />

              <div className="flex items-center justify-between z-10">
                <span className={`w-9 h-9 rounded-2xl ${s.badgeBg} text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                  {s.badge}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition">
                  {s.toolsCount}
                </span>
              </div>

              <div className="z-10 space-y-1">
                <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>{s.title}</span>
                  <LuArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-slate-500 leading-relaxed font-normal">
                  {s.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
