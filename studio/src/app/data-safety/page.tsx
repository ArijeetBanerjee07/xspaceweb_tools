"use client";

import React, { useState } from "react";
import {
  LuShieldCheck,
  LuShield,
  LuFileText,
  LuLock,
  LuGlobe,
  LuUser,
  LuChartBar,
  LuSettings,
  LuDatabase,
  LuServer,
  LuCloud,
  LuTrash2,
  LuUpload,
  LuCreditCard,
  LuSlidersHorizontal,
  LuDownload,
  LuPencil,
  LuCheck,
  LuChevronDown,
} from "react-icons/lu";
import { LegalPageShell, SectionItem } from "@/components/legal/LegalPageShell";

const SECTIONS: SectionItem[] = [
  { id: "commitment", number: 1, title: "Our Commitment" },
  { id: "data-process", number: 2, title: "Data We Process" },
  { id: "how-protect", number: 3, title: "How We Protect Your Data" },
  { id: "retention-flow", number: 4, title: "File Processing & Retention" },
  { id: "third-party", number: 5, title: "Third-Party Services" },
  { id: "control-rights", number: 6, title: "Your Control & Rights" },
  { id: "security-practices", number: 7, title: "Security Practices" },
  { id: "dpdp-act", number: 8, title: "DPDP Act Compliance" },
  { id: "intl-compliance", number: 9, title: "International Compliance" },
  { id: "incident-response", number: 10, title: "Incident Response" },
  { id: "data-requests", number: 11, title: "Data Requests" },
  { id: "contact-us", number: 12, title: "Contact Us" },
];

export default function DataSafetyPage() {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    "security-practices": false,
    "dpdp-act": false,
    "intl-compliance": false,
    "incident-response": false,
    "data-requests": false,
    "contact-us": false,
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <LegalPageShell
      currentPath="/data-safety"
      badge={{
        icon: LuShieldCheck,
        text: "Security & Privacy",
      }}
      title="Data Safety"
      subtitle="Your data is processed with strong security, minimal data collection and zero content retention. Built for your privacy, by design."
      lastUpdated="October 24, 2026"
      scopeText="Applies globally"
      illustrationType="data-safety"
      sections={SECTIONS}
      helpTitle="Have questions?"
      helpDesc="Our privacy and security team is here to help."
      helpButtonText="Contact Support"
    >
      {/* 1. Our Commitment */}
      <section
        id="commitment"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            1
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Our Commitment
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          At XSW Tools, data safety and user privacy are core to everything we build. We follow a privacy-first approach with minimal data collection, secure processing and zero content retention, so your sensitive files always remain yours.
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <LuShield className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Privacy First
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your files are yours. We do not store or use them for training AI.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <LuFileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Minimal Data
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We collect only what is necessary for account, billing and security.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
              <LuLock className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Zero Content Retention
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All uploaded files are automatically deleted within 60 minutes or after processing.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
              <LuGlobe className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Global Compliance
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We follow GDPR, CCPA, DPDP Act and other applicable laws.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Data We Process */}
      <section
        id="data-process"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            2
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Data We Process
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          We only process the minimum data required to provide and secure our services.
        </p>

        {/* 4 Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <LuUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Account Information
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Name, email address, encrypted password hash and subscription tier.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <LuFileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Files You Upload
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Documents, images or other files you process using our tools (not stored long-term).
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <LuChartBar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Usage Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Number of conversions, timestamps and bandwidth for billing and protection against abuse.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <LuSettings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Technical Data
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                IP address, device/browser information and basic logs for security and troubleshooting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How We Protect Your Data */}
      <section
        id="how-protect"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            3
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How We Protect Your Data
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          We apply industry-leading security measures to keep your data safe.
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
              <LuLock className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              TLS 1.3 Encryption
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All data is encrypted in transit using TLS 1.3.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <LuDatabase className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              AES-256 Encryption
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Temporary data is encrypted using AES-256 with restricted access controls.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <LuShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Isolated Processing
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Files are processed in isolated environments with limited access and monitoring.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
              <LuServer className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Access Controls
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Strict access controls, regular audits and security monitoring.
            </p>
          </div>
        </div>
      </section>

      {/* 4. File Processing & Retention */}
      <section
        id="retention-flow"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            4
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            File Processing &amp; Retention
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Uploaded files are never stored permanently on our servers.
        </p>

        {/* 3 Step Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Step 1 */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <LuCloud className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              1. Upload
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              Your file is securely uploaded over TLS 1.3 to an isolated processing instance.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <LuSettings className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              2. In-Memory Processing
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              Files are processed in RAM. If temporary storage is needed, we use encrypted scratch storage with restricted access.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <LuTrash2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              3. Automatic Deletion
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              All files and intermediate data are permanently deleted within 60 minutes or immediately after processing (whichever is earlier).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Third-Party Services */}
      <section
        id="third-party"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            5
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Third-Party Services
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          We use trusted third-party services only for specific features.
        </p>

        {/* 4 Cards (2x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <LuCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                AI Providers
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                e.g. OpenAI, Gemini. Your API keys are isolated and never shared.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <LuCreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Payment Gateway
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Razorpay (RBI-authorized, PCI-DSS Level 1). We do not receive or store your card details.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <LuChartBar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Analytics (Optional)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                e.g. Google Analytics. Used only with your consent where required.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <LuServer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Other Services
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                e.g. Cloud Infrastructure. All providers follow strict security standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Your Control & Rights */}
      <section
        id="control-rights"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            6
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Your Control &amp; Rights
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          You have full control over your data and can exercise your rights anytime.
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
              <LuPencil className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Access &amp; Update
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Edit your profile and settings anytime.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <LuTrash2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Right to Erasure
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Delete your account and all related data instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <LuDownload className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Data Portability
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export your data in JSON or CSV format.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs">
              <LuSlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Cookie Preferences
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Manage or withdraw cookie consent anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ACCORDION SECTIONS: 7 TO 12 */}
      <div className="space-y-3">
        {[
          {
            id: "security-practices",
            number: 7,
            title: "Security Practices",
            content:
              "We perform continuous automated vulnerability scans, enforce Strict-Transport-Security (HSTS), implement Content Security Policies (CSP), and utilize isolated, stateless Docker containers for micro-service execution. No document payload is ever cached outside encrypted transient memory.",
          },
          {
            id: "dpdp-act",
            number: 8,
            title: "DPDP Act (India) Compliance",
            content:
              "XSW Tools complies with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the rules framed thereunder. Indian citizen data is processed strictly in accordance with lawful consent protocols. You may contact our Data Protection Officer for any statutory inquiries.",
          },
          {
            id: "intl-compliance",
            number: 9,
            title: "International Compliance (GDPR, CCPA)",
            content:
              "We strictly adhere to the General Data Protection Regulation (GDPR) for European residents and the California Consumer Privacy Act (CCPA). We enforce data minimization, provide clear consent mechanisms, and never monetize user documents or personal identifying information.",
          },
          {
            id: "incident-response",
            number: 10,
            title: "Incident Response",
            content:
              "Our dedicated security operations maintain 24/7 telemetry monitoring. In the improbable event of an unauthorized system access attempt affecting operational data, our incident response protocol mandates user notification and regulatory escalation within 72 hours.",
          },
          {
            id: "data-requests",
            number: 11,
            title: "Data Requests",
            content:
              "To submit a formal request to view, export, or permanently erase your account data and history, email privacy@xspaceweb.com or submit a ticket via our Help Center. Verification of account ownership is required prior to fulfillment.",
          },
          {
            id: "contact-us",
            number: 12,
            title: "Contact Us",
            content:
              "For inquiries relating to security, infrastructure compliance, or data practices, contact us at security@xspaceweb.com or privacy@xspaceweb.com. We typically respond within 1 business day.",
          },
        ].map((item) => {
          const isOpen = openAccordions[item.id];
          return (
            <div
              key={item.id}
              id={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs scroll-mt-24 transition"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(item.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                    {item.number}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {item.title}
                  </span>
                </div>
                <LuChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </LegalPageShell>
  );
}
