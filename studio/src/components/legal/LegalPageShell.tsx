"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LuArrowRight,
  LuArrowLeft,
  LuHeadphones,
  LuShieldCheck,
  LuFileText,
  LuLock,
  LuCookie,
  LuCheck,
} from "react-icons/lu";
import { PolicyIllustration } from "./PolicyIllustrations";

export interface SectionItem {
  id: string;
  number: number;
  title: string;
}

export interface HighlightCard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color?: "blue" | "emerald" | "purple" | "amber" | "rose" | "sky";
}

interface LegalPageShellProps {
  currentPath: "/privacy" | "/data-safety" | "/terms" | "/cookies";
  badge: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
  };
  title: string;
  subtitle: string;
  lastUpdated: string;
  scopeText?: string;
  illustrationType: "privacy" | "data-safety" | "terms" | "cookies";
  highlights?: HighlightCard[];
  sections: SectionItem[];
  helpTitle?: string;
  helpDesc?: string;
  helpButtonText?: string;
  children: React.ReactNode;
}

export function LegalPageShell({
  currentPath,
  badge: BadgeComponent,
  title,
  subtitle,
  lastUpdated,
  scopeText = "Applies globally",
  illustrationType,
  highlights,
  sections,
  helpTitle = "Have questions?",
  helpDesc = "Our privacy and security team is here to help.",
  helpButtonText = "Contact Support",
  children,
}: LegalPageShellProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id || ""
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop - offset;
          if (scrollY >= top) {
            setActiveSectionId(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const navLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/data-safety", label: "Data Safety" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/cookies", label: "Cookie Policy" },
  ];

  const colorStyles: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
    sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ================= HEADER NAVBAR ================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center group shrink-0 py-1">
              <img
                src="/logo-full.png?v=10"
                alt="XSWTOOLS - Every Tool. One Workspace."
                className="h-10 sm:h-11 md:h-12 w-auto object-contain group-hover:opacity-95 transition-opacity"
              />
            </Link>

            {/* Desktop Quick Policy Switcher Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-2xs"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
            >
              <LuArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-[0.98]"
            >
              <span>Workspace</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile Policy Switcher Scrollbar */}
        <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {navLinks.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef7fc]/80 via-[#f8fafc] to-[#f8fafc] border-b border-slate-200/80 pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Soft radial glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Hero Text */}
          <div className="flex-1 text-center lg:text-left space-y-4 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
              <BadgeComponent.icon className="w-3.5 h-3.5 text-blue-600" />
              <span>{BadgeComponent.text}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {subtitle}
            </p>

            {/* Metadata (Date & Scope) */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-slate-400 font-mono pt-1">
              <span>Last Updated: {lastUpdated}</span>
              <span>&bull;</span>
              <span>{scopeText}</span>
            </div>
          </div>

          {/* Right Hero Illustration */}
          <div className="shrink-0 w-full lg:w-auto flex justify-center">
            <PolicyIllustration type={illustrationType} />
          </div>
        </div>
      </section>

      {/* ================= TOP 4 HIGHLIGHT CARDS (Optional) ================= */}
      {highlights && highlights.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-10 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {highlights.map((card, idx) => {
              const Icon = card.icon;
              const colorKey = card.color || (["blue", "emerald", "purple", "amber"][idx % 4] as any);
              const styling = colorStyles[colorKey] || colorStyles.blue;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-blue-200 hover:shadow-sm transition"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${styling.bg} ${styling.text} border ${styling.border} flex items-center justify-center mb-3 shadow-2xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= MAIN TWO-COLUMN BODY ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex-1 w-full flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* LEFT COLUMN: STICKY SIDEBAR */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4 self-start lg:sticky lg:top-24">
          {/* On this page box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 px-1">
              On this page
            </h4>
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {sections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-mono shrink-0 ${
                        isActive ? "text-blue-600 font-bold" : "text-slate-400"
                      }`}
                    >
                      {sec.number}.
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Help Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <LuHeadphones className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">{helpTitle}</h5>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {helpDesc}
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>{helpButtonText}</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* RIGHT COLUMN: SECTION CARDS */}
        <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          {children}
        </div>
      </main>

      {/* ================= COMPREHENSIVE FOOTER ================= */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center group py-1 mb-3">
              <img
                src="/logo-full.png?v=10"
                alt="XSWTOOLS - Every Tool. One Workspace."
                className="h-12 sm:h-14 w-auto object-contain group-hover:opacity-95 transition-opacity"
              />
            </Link>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Every tool you need in one workspace. Fast, privacy-first, zero-install processing across 9 production studios and 40+ digital utilities.
            </p>
            <div className="mt-4 text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} XSW Tools. All rights reserved.
            </div>
          </div>

          {/* Legal & Privacy Pages */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Trust &amp; Legal
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className={`transition ${
                    currentPath === "/privacy"
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/data-safety"
                  className={`transition ${
                    currentPath === "/data-safety"
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Data Safety
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={`transition ${
                    currentPath === "/terms"
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className={`transition ${
                    currentPath === "/cookies"
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-blue-600 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Document Studios */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Document Studios
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/app/studios/pdf" className="hover:text-blue-600 transition">
                  PDF Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/ai-document" className="hover:text-blue-600 transition">
                  AI Document Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/document-hub" className="hover:text-blue-600 transition">
                  Document Hub
                </Link>
              </li>
              <li>
                <Link href="/app/studios/security" className="hover:text-blue-600 transition">
                  Security &amp; E-Sign
                </Link>
              </li>
            </ul>
          </div>

          {/* Media & SEO Studios */}
          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
              Media Studios
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/app/studios/background" className="hover:text-blue-600 transition">
                  Background Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/compress" className="hover:text-blue-600 transition">
                  Compress &amp; Enhance
                </Link>
              </li>
              <li>
                <Link href="/app/studios/office" className="hover:text-blue-600 transition">
                  Office Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/qr-link" className="hover:text-blue-600 transition">
                  QR &amp; Link Studio
                </Link>
              </li>
              <li>
                <Link href="/app/studios/trendrank" className="hover:text-blue-600 transition">
                  TrendRank AI
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Client-Side In-Browser Operations</span>
            <span>&bull;</span>
            <span>Zero Content Retention</span>
            <span>&bull;</span>
            <span>TLS 1.3 / AES-256</span>
          </div>
          <div>
            <span>XSW Tools by XSPACEWEB PRIVATE LIMITED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
