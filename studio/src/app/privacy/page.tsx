"use client";

import React from "react";
import {
  LuShield,
  LuZap,
  LuDatabase,
  LuLock,
  LuKey,
  LuUser,
  LuChartBar,
  LuFileText,
  LuUpload,
  LuSettings,
  LuTrash2,
  LuArrowRight,
  LuDownload,
  LuCheck,
  LuMail,
  LuChevronDown,
} from "react-icons/lu";
import { LegalPageShell, HighlightCard, SectionItem } from "@/components/legal/LegalPageShell";

const SECTIONS: SectionItem[] = [
  { id: "intro-scope", number: 1, title: "Introduction & Scope" },
  { id: "info-collect", number: 2, title: "Information We Collect" },
  { id: "file-destruction", number: 3, title: "Automated File Destruction Pipeline" },
  { id: "payment-security", number: 4, title: "Payment & Financial Security" },
  { id: "rights-control", number: 5, title: "Your Rights & Data Control" },
  { id: "dpdp-compliance", number: 6, title: "DPDP Act Compliance (India)" },
  { id: "intl-compliance", number: 7, title: "International Compliance" },
  { id: "children-privacy", number: 8, title: "Children's Privacy" },
  { id: "policy-changes", number: 9, title: "Changes to This Policy" },
  { id: "contact-privacy", number: 10, title: "Contact Our Privacy Team" },
];

const HIGHLIGHTS: HighlightCard[] = [
  {
    icon: LuZap,
    title: "Ephemeral Processing",
    desc: "Uploaded files are processed in isolated memory buffers and purged automatically within 60 minutes or immediately upon job completion.",
    color: "blue",
  },
  {
    icon: LuDatabase,
    title: "Zero Content Storage",
    desc: "We never inspect, train AI models on, or resell the contents of your PDFs, spreadsheets, documents, or images.",
    color: "emerald",
  },
  {
    icon: LuLock,
    title: "Bank-Grade Encryption",
    desc: "All transfers are encrypted via TLS 1.3 in transit and AES-256 for temporary storage tokens with restricted access controls.",
    color: "purple",
  },
  {
    icon: LuKey,
    title: "BYOK Key Isolation",
    desc: "Custom external API keys (OpenAI, Gemini) remain isolated in your encrypted session store and are never exposed to other tenants.",
    color: "amber",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      currentPath="/privacy"
      badge={{
        icon: LuShield,
        text: "Your Privacy Matters",
      }}
      title="Privacy Policy"
      subtitle="Your trust is our foundation, XSW Tools operates on an ephemeral processing standard designed so that your sensitive files belong solely to you."
      lastUpdated="October 24, 2026"
      scopeText="Effective Globally"
      illustrationType="privacy"
      highlights={HIGHLIGHTS}
      sections={SECTIONS}
      helpTitle="Have questions?"
      helpDesc="Our privacy team is here to help."
      helpButtonText="Contact Privacy Team"
    >
      {/* 1. Introduction & Scope */}
      <section
        id="intro-scope"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            1
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Introduction &amp; Scope
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pt-1">
          <p>
            This Privacy Policy explains how <strong>XSW Tools</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) handles personal data and digital files when you interact with our website, APIs, and suite of 9 web studios (PDF Studio, AI Document Studio, Background Studio, Document Hub, Security &amp; E-Signature, Office Studio, Compress &amp; Enhance, QR &amp; Link Studio, and TrendRank AI).
          </p>
          <p>
            By accessing or using XSW Tools, you consent to the processing routines outlined here in compliance with applicable international data privacy standards, including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and the Digital Personal Data Protection Act (DPDP), India.
          </p>
        </div>
      </section>

      {/* 2. Information We Collect */}
      <section
        id="info-collect"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            2
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Information We Collect
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          We purposefully minimize data collection to the absolute operational baseline:
        </p>

        <div className="space-y-3 pt-2">
          {/* Card 1: Account Information */}
          <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <LuUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Account Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                If you register, we store your email address, encrypted authentication password hash, name, and subscription tier.
              </p>
            </div>
          </div>

          {/* Card 2: Usage Metrics */}
          <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <LuChartBar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Usage Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Number of conversions executed, timestamps, and bandwidth consumed for billing and rate-limiting enforcement.
              </p>
            </div>
          </div>

          {/* Card 3: Document Payloads */}
          <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <LuFileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Document Payloads
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Files uploaded for conversion, signing, compression, or analysis. These are never retained permanently and are destroyed post-execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Automated File Destruction Pipeline */}
      <section
        id="file-destruction"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            3
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Automated File Destruction Pipeline
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          When you submit a file to any studio:
        </p>

        {/* 3 Step Connected Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 relative items-center">
          {/* Step 1 */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <LuUpload className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              1. Secure Upload
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              Your file is transmitted over TLS 1.3 to an isolated ephemeral worker instance.
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
              Processing occurs in RAM buffers. If temporary disk staging is necessary, it is written to an encrypted ephemeral scratch volume.
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
              Once the processed file is downloaded or 60 minutes elapse (whichever occurs first), all copies and intermediate artifacts are permanently purged.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Payment & Financial Security */}
      <section
        id="payment-security"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            4
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Payment &amp; Financial Security
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          All financial transactions, invoices, and payment card interactions are processed through Razorpay, an RBI-authorized and PCI-DSS Level 1 certified payment aggregator.
        </p>

        {/* Highlight Callout Box */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <LuShield className="w-4 h-4" />
          </div>
          <p className="leading-relaxed font-medium">
            <strong>XSW Tools never receives, stores, or sees your credit card number, CVV, or bank account credentials.</strong> Payments use tokenized end-to-end encryption.
          </p>
        </div>
      </section>

      {/* 5. Your Rights & Data Control */}
      <section
        id="rights-control"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            5
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Your Rights &amp; Data Control
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Regardless of your geographical location, XSW Tools grants you full ownership over your account:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <LuFileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Right to Rectification
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Edit your name, profile, and settings anytime.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LuTrash2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Right to Erasure (&ldquo;Right to be Forgotten&rdquo;)
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Delete your workspace and all corresponding logs instantly with one click from Account Settings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LuDownload className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Data Portability
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Export your conversion histories and invoices in standard JSON or CSV format.
            </p>
          </div>
        </div>
      </section>

      {/* 6. DPDP Act Compliance (India) */}
      <section
        id="dpdp-compliance"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            6
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            DPDP Act Compliance (India)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          XSW Tools complies with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the rules framed thereunder.
        </p>

        {/* Green Box: Our Key Commitments under DPDP Act */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
            <LuCheck className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Our Key Commitments under DPDP Act</span>
          </h3>

          <ul className="space-y-2 text-xs text-emerald-900/90 font-medium">
            <li className="flex items-center gap-2">
              <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Process personal data only for specified, lawful purposes</span>
            </li>
            <li className="flex items-center gap-2">
              <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Collect only necessary and proportionate data</span>
            </li>
            <li className="flex items-center gap-2">
              <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Provide clear notice and obtain consent where required</span>
            </li>
            <li className="flex items-center gap-2">
              <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Respect your rights to access, correction and erasure</span>
            </li>
            <li className="flex items-center gap-2">
              <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Implement reasonable security safeguards</span>
            </li>
            <li className="flex items-center gap-2">
              <LuCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Engage only trusted service providers with adequate protections</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 7. International Compliance */}
      <section
        id="intl-compliance"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            7
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            International Compliance (GDPR &amp; CCPA)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          For users in the European Economic Area (EEA), UK, and Switzerland, our processing aligns with Regulation (EU) 2016/679 (GDPR). For California residents, we honor California Consumer Privacy Act (CCPA) provisions. <strong>We do not sell or share personal information</strong> with advertising brokers or data consolidators.
        </p>
      </section>

      {/* 8. Children's Privacy */}
      <section
        id="children-privacy"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            8
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Children&apos;s Privacy
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          XSW Tools is designed for professional and educational document operations. We do not knowingly collect or solicit personal data from children under the age of 16. If we become aware that personal information from a minor has been gathered without parental verification, we immediately purge the data from our databases.
        </p>
      </section>

      {/* 9. Changes to This Policy */}
      <section
        id="policy-changes"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            9
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Changes to This Policy
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We may revise this Privacy Policy periodically to reflect infrastructure enhancements, statutory updates, or regulatory adjustments. When changes occur, the &ldquo;Last Updated&rdquo; timestamp will be revised accordingly. Material revisions will be prominently announced in your workspace dashboard.
        </p>
      </section>

      {/* 10. Contact Our Privacy Team */}
      <section
        id="contact-privacy"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            10
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Contact Our Privacy Team
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          If you have any questions, privacy inquiries, or data access requests regarding this policy, please reach out to our dedicated privacy officers:
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div>
            <strong>Company:</strong> XSPACEWEB PRIVATE LIMITED
          </div>
          <div>
            <strong>Privacy Email:</strong>{" "}
            <a href="mailto:privacy@xspaceweb.com" className="text-blue-600 font-semibold hover:underline">
              privacy@xspaceweb.com
            </a>
          </div>
          <div>
            <strong>Support Desk:</strong>{" "}
            <a href="mailto:support@xspaceweb.com" className="text-blue-600 font-semibold hover:underline">
              support@xspaceweb.com
            </a>
          </div>
        </div>
      </section>
    </LegalPageShell>
  );
}
