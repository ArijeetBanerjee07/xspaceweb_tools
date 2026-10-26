"use client";

import React, { useState } from "react";
import {
  LuCookie,
  LuShield,
  LuSettings,
  LuChartBar,
  LuUser,
  LuChevronDown,
} from "react-icons/lu";
import { LegalPageShell, HighlightCard, SectionItem } from "@/components/legal/LegalPageShell";

const SECTIONS: SectionItem[] = [
  { id: "what-are-cookies", number: 1, title: "What Are Cookies?" },
  { id: "how-we-use", number: 2, title: "How We Use Cookies" },
  { id: "types-of-cookies", number: 3, title: "Types of Cookies" },
  { id: "analytics-third-party", number: 4, title: "Analytics & Third Parties" },
  { id: "consent-controls", number: 5, title: "Consent & Cookie Controls" },
  { id: "retention", number: 6, title: "Retention" },
  { id: "privacy-rights", number: 7, title: "Your Privacy Rights" },
  { id: "policy-updates", number: 8, title: "Policy Updates" },
  { id: "contact-us", number: 9, title: "Contact Us" },
];

const HIGHLIGHTS: HighlightCard[] = [
  {
    icon: LuShield,
    title: "Essential Cookies",
    desc: "Required for login, security, and core functions.",
    color: "blue",
  },
  {
    icon: LuSettings,
    title: "Preferences",
    desc: "Remember your language, settings and customisations.",
    color: "purple",
  },
  {
    icon: LuChartBar,
    title: "Analytics",
    desc: "Help us understand how our tools are used (only where enabled).",
    color: "emerald",
  },
  {
    icon: LuUser,
    title: "Your Choice",
    desc: "Manage optional cookies at any time through your browser or our cookie settings.",
    color: "amber",
  },
];

interface CookieSectionData {
  id: string;
  number: number;
  title: string;
  content: string;
}

const COOKIE_ITEMS: CookieSectionData[] = [
  {
    id: "what-are-cookies",
    number: 1,
    title: "What Are Cookies?",
    content:
      "Cookies are small text files and similar technologies that are stored on your device when you visit our website or use our services. They help us make our website work properly, enhance your experience, and understand how our tools are used.",
  },
  {
    id: "how-we-use",
    number: 2,
    title: "How We Use Cookies",
    content:
      "We use cookies to ensure the proper functioning of XSWTOOLS, maintain secure user sessions, remember your preferences, measure performance (where enabled), and improve our services.",
  },
  {
    id: "types-of-cookies",
    number: 3,
    title: "Types of Cookies",
    content:
      "We use different types of cookies, including essential cookies, preference cookies, analytics cookies, and marketing cookies (where applicable). Each type serves a specific purpose and is handled according to your consent and applicable law.",
  },
  {
    id: "analytics-third-party",
    number: 4,
    title: "Analytics & Third Parties",
    content:
      "We may use trusted third-party services (such as analytics or infrastructure providers) that can set their own cookies. These third parties process data according to their respective privacy and cookie policies.",
  },
  {
    id: "consent-controls",
    number: 5,
    title: "Consent & Cookie Controls",
    content:
      "Where required, we obtain your consent before activating non-essential cookies. You can accept all cookies, reject optional cookies, or manage your preferences through our cookie settings. You can also change or withdraw your consent at any time.",
  },
  {
    id: "retention",
    number: 6,
    title: "Retention",
    content:
      "Session cookies expire when you close your browser. Persistent cookies remain on your device for a set period, as specified in our cookie settings or by the relevant third-party provider.",
  },
  {
    id: "privacy-rights",
    number: 7,
    title: "Your Privacy Rights",
    content:
      "Where cookies process personal data, we handle such processing in accordance with applicable data protection laws, including India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the DPDP Rules, 2025, as applicable.",
  },
  {
    id: "policy-updates",
    number: 8,
    title: "Policy Updates",
    content:
      "We may update this Cookie Policy from time to time. Any changes will be posted on this page with a revised 'Last Updated' date.",
  },
  {
    id: "contact-us",
    number: 9,
    title: "Contact Us",
    content:
      "If you have any questions about this Cookie Policy, you can contact our privacy team at privacy@xspaceweb.com or support@xspaceweb.com.",
  },
];

export default function CookiePolicyPage() {
  // All accordions open by default as shown in Image 2
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "what-are-cookies": true,
    "how-we-use": true,
    "types-of-cookies": true,
    "analytics-third-party": true,
    "consent-controls": true,
    "retention": true,
    "privacy-rights": true,
    "policy-updates": true,
    "contact-us": true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <LegalPageShell
      currentPath="/cookies"
      badge={{
        icon: LuCookie,
        text: "Privacy & Cookies",
      }}
      title="Cookie Policy"
      subtitle="Learn how XSWTOOLS uses cookies and similar technologies to keep your workspace secure, understand site performance, and remember your preferences."
      lastUpdated="October 26, 2026"
      scopeText="Applies globally"
      illustrationType="cookies"
      highlights={HIGHLIGHTS}
      sections={SECTIONS}
      helpTitle="Need help?"
      helpDesc="Have questions about our Cookie Policy?"
      helpButtonText="Contact Privacy Team"
    >
      <div className="space-y-4">
        {COOKIE_ITEMS.map((item) => {
          const isOpen = openItems[item.id] !== false;
          return (
            <section
              key={item.id}
              id={item.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs scroll-mt-24 transition"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/50 transition gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {item.number}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {item.title}
                  </h2>
                </div>
                <LuChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                  <p className="pt-3">{item.content}</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </LegalPageShell>
  );
}
