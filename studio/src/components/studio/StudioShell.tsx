"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UpgradeCheckoutModal } from "./UpgradeCheckoutModal";
import { TOOLS_CATALOG, CatalogTool } from "@/config/toolsCatalog";
import {
  LuClock,
  LuCreditCard,
  LuSettings,
  LuCrown,
  LuCheck,
  LuSearch,
  LuX,
  LuArrowRight,
  LuCircleHelp,
} from "react-icons/lu";
import { useProStatus } from "@/lib/gating";
import { WorkspaceProvider } from "@/lib/workspace-context";

interface StudioShellProps {
  user: {
    name?: string | null;
    email: string;
  };
  workspace: {
    name: string;
    planId: string;
  };
  role: string;
  children: React.ReactNode;
}

export function StudioShell({ user, workspace, role, children }: StudioShellProps) {
  const isPro = useProStatus(workspace?.planId);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isStudiosOpen, setIsStudiosOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Tool Search State
  const [toolSearch, setToolSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTools: CatalogTool[] = toolSearch.trim()
    ? TOOLS_CATALOG.filter((t) => {
        const q = toolSearch.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.studioName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  const studios = [
    { name: "PDF Studio", href: "/app/studios/pdf", iconColor: "bg-red-500 text-white", label: "PDF" },
    { name: "AI Document Studio", href: "/app/studios/ai-document", iconColor: "bg-sky-500 text-white", label: "AI" },
    { name: "Document Hub", href: "/app/studios/document-hub", iconColor: "bg-cyan-500 text-white", label: "DOC" },
    { name: "Security & E-Signature", href: "/app/studios/security", iconColor: "bg-emerald-500 text-white", label: "SEC" },
    { name: "QR & Link Studio", href: "/app/studios/qr-link", iconColor: "bg-rose-500 text-white", label: "QR" },
    { name: "Background Studio", href: "/app/studios/background", iconColor: "bg-blue-600 text-white", label: "BG" },
    { name: "Office Studio", href: "/app/studios/office", iconColor: "bg-teal-500 text-white", label: "OFF" },
    { name: "Compress & Enhance", href: "/app/studios/compress", iconColor: "bg-emerald-600 text-white", label: "ZIP" },
    { name: "TrendRank AI", href: "/app/studios/trendrank", iconColor: "bg-violet-600 text-white", label: "SEO" },
  ];

  // Lower menu with My Files removed per user requirement
  const lowerMenu = [
    { name: "Recent Activity", href: "/app/recent", icon: LuClock },
    { name: "Usage & Billing", href: "/app/usage", icon: LuCreditCard },
    { name: "Settings", href: "/app/settings", icon: LuSettings },
  ];

  const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");
  const displayRole = role === "owner" ? "Workspace Owner" : role;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row antialiased">
      {/* Upgrade Modal */}
      <UpgradeCheckoutModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b1021] text-white border-b border-slate-800 sticky top-0 z-40">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3bb1df]/15 border border-[#3bb1df]/30 flex items-center justify-center p-1 shrink-0">
            <img
              src="/brand/xswtools_logo.png"
              alt="xswtools"
              className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(59,177,223,0.5)]"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            xsw<span className="text-[#3bb1df]">tools</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar - Dark Navy exactly as in the mockups */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-[#0b1021] border-r border-[#1e293b]/70 flex flex-col shrink-0 z-30 transition-all`}
      >
        <div className="p-4 flex-1 flex flex-col overflow-y-auto space-y-6">
          {/* Logo & Brand Header */}
          <Link href="/app" className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3bb1df]/20 to-blue-600/10 border border-[#3bb1df]/30 flex items-center justify-center p-1.5 shrink-0 shadow-sm shadow-[#3bb1df]/20 group-hover:border-[#3bb1df]/60 transition">
              <img
                src="/brand/xswtools_logo.png"
                alt="xswtools"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(59,177,223,0.5)]"
              />
            </div>
            <div>
              <div className="font-extrabold text-white text-[17px] tracking-tight leading-none group-hover:text-blue-300 transition">
                xsw<span className="text-[#3bb1df]">tools</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1 leading-none tracking-wide">
                Every Tool. One Workspace.
              </div>
            </div>
          </Link>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <Link
              href="/app"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/app"
                  ? "bg-[#3bb1df] text-white shadow-sm shadow-[#3bb1df]/25"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/app/tools"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/app/tools"
                  ? "bg-[#3bb1df] text-white shadow-sm shadow-[#3bb1df]/25"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>All Tools</span>
            </Link>
          </div>

          {/* STUDIOS Collapsible Section */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setIsStudiosOpen(!isStudiosOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition"
            >
              <span>Studios</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${isStudiosOpen ? "rotate-0" : "-rotate-90"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isStudiosOpen && (
              <div className="space-y-0.5 pt-0.5">
                {studios.map((s) => {
                  const isActive = pathname.startsWith(s.href);
                  return (
                    <Link
                      key={s.name}
                      href={s.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? "bg-[#3bb1df] text-white font-semibold shadow-sm shadow-[#3bb1df]/25"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${s.iconColor}`}
                        >
                          {s.label}
                        </span>
                        <span className="truncate">{s.name}</span>
                      </div>
                      {isActive && <span className="text-white text-xs">→</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lower Menu */}
          <div className="space-y-0.5 pt-2 border-t border-slate-800/80">
            {lowerMenu.map((item) => {
              const isActive =
                item.name === "My Files" ? pathname === "/app" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-[#3bb1df] text-white font-semibold shadow-sm shadow-[#3bb1df]/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Pro Status in Sidebar */}
          <div className="pt-2 mt-auto">
            {mounted && isPro ? (
              <div className="relative rounded-2xl bg-gradient-to-br from-[#1b2848] via-[#121c38] to-[#0a1122] border border-amber-400/40 p-4 text-white overflow-hidden shadow-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                    <LuCrown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs tracking-tight text-white block">XSW Tools Pro</span>
                    <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Subscriber
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  All 9 studios, neural AI engines &amp; unlimited generations active.
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl bg-gradient-to-b from-[#141b34] to-[#0c1224] border border-[#2b395c] p-4 text-white overflow-hidden shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <LuCrown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-xs tracking-tight text-white">Upgrade to Pro</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300 mb-4">
                  <li className="flex items-center gap-1.5">
                    <LuCheck className="w-3.5 h-3.5 text-[#3bb1df] shrink-0" />
                    <span>More storage space</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <LuCheck className="w-3.5 h-3.5 text-[#3bb1df] shrink-0" />
                    <span>Advanced file management</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <LuCheck className="w-3.5 h-3.5 text-[#3bb1df] shrink-0" />
                    <span>Cloud backup</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <LuCheck className="w-3.5 h-3.5 text-[#3bb1df] shrink-0" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <LuCheck className="w-3.5 h-3.5 text-[#3bb1df] shrink-0" />
                    <span>No ads</span>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setIsUpgradeOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#3bb1df] to-[#259ece] hover:from-[#32a8d6] hover:to-[#1e91be] text-white font-semibold text-xs transition shadow-md shadow-[#3bb1df]/30 flex items-center justify-center gap-1.5"
                >
                  <span>Upgrade Now</span>
                  <LuArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
          {/* Global Tool Search Bar with Dropdown */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LuSearch className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={toolSearch}
                onChange={(e) => {
                  setToolSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search any tool... (Ctrl + K)"
                className="w-full pl-10 pr-9 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-xs text-slate-800 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {toolSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setToolSearch("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Tool Search Results Dropdown */}
            {isSearchOpen && toolSearch.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50">
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>
                    Tools matching &quot;<strong className="text-slate-800">{toolSearch}</strong>&quot;
                  </span>
                  <span>
                    {filteredTools.length} result{filteredTools.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {filteredTools.length > 0 ? (
                    filteredTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.studioHref}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setToolSearch("");
                        }}
                        className="p-3 hover:bg-blue-50/60 flex items-start gap-3 transition group text-left"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${tool.studioColor}`}
                        >
                          {tool.studioBadge}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition truncate">
                              {tool.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              {tool.studioName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {tool.description}
                          </p>
                        </div>
                        <LuArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-700">No tools found</p>
                      <p>
                        Try searching for &quot;pdf&quot;, &quot;invoice&quot;, &quot;compress&quot;, or &quot;qr&quot;.
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">Esc</kbd> to dismiss
                  </span>
                  <Link
                    href="/app/help"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View Help Center →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Upgrade Plan Pill or Active Pro Badge */}
            {isPro ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 to-amber-100/70 text-amber-900 text-xs font-extrabold shadow-2xs">
                <LuCrown className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                <span>PRO ACTIVE</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition"
              >
                <LuCrown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Upgrade Plan</span>
              </button>
            )}

            {/* Help & Documentation Button */}
            <Link
              href="/app/help"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition flex items-center justify-center"
              aria-label="Help Center & Documentation"
              title="Help Center & Documentation"
            >
              <LuCircleHelp className="w-5 h-5" />
            </Link>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                  <span>{displayName.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                    <span>{displayName}</span>
                    {isPro && (
                      <span className="px-1.5 py-0.5 rounded-full font-black text-[9px] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 uppercase tracking-wider shadow-2xs">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize leading-tight">{displayRole}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-semibold text-slate-800">{displayName}</div>
                    <div className="text-slate-400 truncate">{user.email}</div>
                  </div>
                  <Link
                    href="/app/settings"
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/app/usage"
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Usage & Billing
                  </Link>
                  <form
                    action="/api/auth/signout"
                    method="POST"
                    className="border-t border-slate-100 pt-1"
                  >
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Child Pages (Light Canvas) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <WorkspaceProvider value={{ user, workspace, role, isPro }}>
            {children}
          </WorkspaceProvider>
        </main>
      </div>
    </div>
  );
}
