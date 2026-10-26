"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LuFileText,
  LuCircleX,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { LegalPageShell, SectionItem } from "@/components/legal/LegalPageShell";

const SECTIONS: SectionItem[] = [
  { id: "intro", number: 1, title: "Introduction" },
  { id: "acceptance", number: 2, title: "Acceptance of Terms" },
  { id: "services", number: 3, title: "Our Services" },
  { id: "accounts", number: 4, title: "User Accounts" },
  { id: "permitted-use", number: 5, title: "Permitted Use" },
  { id: "prohibited-use", number: 6, title: "Prohibited Use" },
  { id: "intellectual-property", number: 7, title: "Intellectual Property" },
  { id: "file-processing", number: 8, title: "File Processing & Data" },
  { id: "third-parties", number: 9, title: "Third-Party Services" },
  { id: "subscriptions", number: 10, title: "Subscriptions & Payments" },
  { id: "refund-policy", number: 11, title: "Refund Policy" },
  { id: "liability", number: 12, title: "Limits of Liability" },
  { id: "disclaimers", number: 13, title: "Disclaimers" },
  { id: "termination", number: 14, title: "Termination" },
  { id: "governing-law", number: 15, title: "Governing Law" },
  { id: "dispute-resolution", number: 16, title: "Dispute Resolution" },
  { id: "changes-to-terms", number: 17, title: "Changes to Terms" },
  { id: "contact-us", number: 18, title: "Contact Us" },
];

export default function TermsAndConditionsPage() {
  const [showMoreSections, setShowMoreSections] = useState(false);

  return (
    <LegalPageShell
      currentPath="/terms"
      badge={{
        icon: LuFileText,
        text: "Legal",
      }}
      title="Terms & Conditions"
      subtitle="Please read these Terms & Conditions carefully before using XSW Tools. By accessing or using our website, services, or tools, you agree to be bound by these terms."
      lastUpdated="October 24, 2026"
      scopeText="Effective Globally"
      illustrationType="terms"
      sections={SECTIONS}
      helpTitle="Need Help?"
      helpDesc="Have questions about our terms?"
      helpButtonText="Contact Support"
    >
      {/* 1. Introduction */}
      <section
        id="intro"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            1
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Introduction
          </h2>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 pt-1">
          <p>
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of XSW Tools (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), including our website, web applications, APIs, and the suite of 9 studios (PDF Studio, QR &amp; Link Studio, Image Studio, Convert Files, Edit Studio, Security Studio, Office Studio, Compress &amp; Enhance, and Background Studio).
          </p>
          <p>
            XSW Tools is operated by XSPACEWEB PRIVATE LIMITED, an Indian company. These Terms apply to all users worldwide.
          </p>
        </div>
      </section>

      {/* 2. Acceptance of Terms */}
      <section
        id="acceptance"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            2
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Acceptance of Terms
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          By accessing or using XSW Tools, you agree to be legally bound by these Terms, our{" "}
          <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">
            Privacy Policy
          </Link>
          , and any additional guidelines. If you do not agree with any part of these Terms, you must not use our services.
        </p>
      </section>

      {/* 3. Our Services */}
      <section
        id="services"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            3
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Our Services
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          XSW Tools provides a collection of online tools for document processing, file conversion, image editing, QR &amp; link generation, and related productivity services. We reserve the right to modify, suspend, or discontinue any part of the services at any time, with or without notice.
        </p>
      </section>

      {/* 4. User Accounts */}
      <section
        id="accounts"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            4
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            User Accounts
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information and keep it updated.
        </p>
      </section>

      {/* 5. Permitted Use */}
      <section
        id="permitted-use"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            5
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Permitted Use
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          You may use XSW Tools only for lawful purposes and in accordance with these Terms. You may process your own files and content or files for which you have the necessary rights and permissions.
        </p>
      </section>

      {/* 6. Prohibited Use */}
      <section
        id="prohibited-use"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-4"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            6
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Prohibited Use
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          You must not use our services to:
        </p>

        {/* 2x3 Grid with red prohibited icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700">
            <LuCircleX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>Process illegal, harmful, abusive, or infringing content.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700">
            <LuCircleX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>Upload malware, viruses, or malicious files.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700">
            <LuCircleX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>Violate any applicable laws or regulations.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700">
            <LuCircleX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>Use automated bots or scripts to abuse the services.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700">
            <LuCircleX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>Attempt to reverse engineer, copy, or extract our source code.</span>
          </div>
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs text-slate-700">
            <LuCircleX className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>Resell, redistribute, or commercially exploit our tools without permission.</span>
          </div>
        </div>
      </section>

      {/* 7. Intellectual Property */}
      <section
        id="intellectual-property"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            7
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Intellectual Property
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          All content, trademarks, logos, designs, and software on XSW Tools are the property of XSPACEWEB PRIVATE LIMITED or its licensors. You may not copy, modify, distribute, or create derivative works without our prior written consent.
        </p>
      </section>

      {/* 8. File Processing & Data */}
      <section
        id="file-processing"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            8
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            File Processing &amp; Data
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          Your files are processed in isolated environments and are automatically deleted within 60 minutes or immediately after processing, whichever is earlier. We do not permanently store, inspect, or use your files for training AI models. For more details, please refer to our{" "}
          <Link href="/privacy" className="text-blue-600 font-semibold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      {/* 9. Third-Party Services */}
      <section
        id="third-parties"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            9
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Third-Party Services
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          We may integrate third-party services (e.g., OpenAI, Google, Razorpay) for specific features. Your use of these services is subject to their respective terms and privacy policies. We are not responsible for their practices.
        </p>
      </section>

      {/* 10. Subscriptions & Payments */}
      <section
        id="subscriptions"
        className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            10
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Subscriptions &amp; Payments
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
          Some features require a paid subscription. Payments are processed securely through Razorpay, an RBI-authorized and PCI-DSS Level 1 certified payment aggregator. By purchasing a subscription, you agree to the applicable plan, pricing, and billing terms.
        </p>
      </section>

      {/* EXPANDABLE SECTIONS: 11 TO 18 */}
      {showMoreSections ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 11. Refund Policy */}
          <section
            id="refund-policy"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                11
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Refund Policy
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              We offer a 7-day refund policy on recurring Pro and Team subscriptions for users who experience technical failure preventing tool usage, provided that fewer than 10 tool operations were executed during that billing cycle. Refund requests can be directed to billing@xspaceweb.com.
            </p>
          </section>

          {/* 12. Limits of Liability */}
          <section
            id="liability"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                12
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Limits of Liability
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              To the maximum extent permitted by law, XSPACEWEB PRIVATE LIMITED and its directors, employees, or partners shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from document loss, data corruption, or service interruption.
            </p>
          </section>

          {/* 13. Disclaimers */}
          <section
            id="disclaimers"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                13
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Disclaimers
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              Our tools and services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied. We do not warrant that our services will be uninterrupted, error-free, or entirely bug-free.
            </p>
          </section>

          {/* 14. Termination */}
          <section
            id="termination"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                14
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Termination
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              We reserve the right to suspend or terminate your account or access to the services immediately and without notice if you violate any of these Terms, engage in abuse of our API limits, or compromise platform integrity.
            </p>
          </section>

          {/* 15. Governing Law */}
          <section
            id="governing-law"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                15
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Governing Law
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              These Terms and any disputes arising out of or related to them shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
            </p>
          </section>

          {/* 16. Dispute Resolution */}
          <section
            id="dispute-resolution"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                16
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Dispute Resolution
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              Any dispute, controversy, or claim arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          {/* 17. Changes to Terms */}
          <section
            id="changes-to-terms"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                17
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Changes to Terms
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              We may revise these Terms at any time by updating this page. Your continued use of XSW Tools after revisions are posted constitutes your acceptance of the revised Terms.
            </p>
          </section>

          {/* 18. Contact Us */}
          <section
            id="contact-us"
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs scroll-mt-24 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                18
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Contact Us
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              For any legal notices, inquiries regarding these Terms, or corporate questions, please contact our legal team at{" "}
              <a href="mailto:legal@xspaceweb.com" className="text-blue-600 font-semibold hover:underline">
                legal@xspaceweb.com
              </a>{" "}
              or via our{" "}
              <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                Contact Portal
              </Link>
              .
            </p>
          </section>
        </div>
      ) : null}

      {/* View More Sections Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => setShowMoreSections(!showMoreSections)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-600 shadow-xs transition cursor-pointer"
        >
          {showMoreSections ? (
            <>
              <LuChevronUp className="w-4 h-4 text-blue-600" />
              <span>Show Less Sections</span>
            </>
          ) : (
            <>
              <LuChevronDown className="w-4 h-4 text-blue-600" />
              <span>View More Sections (11 &ndash; 18)</span>
            </>
          )}
        </button>
      </div>
    </LegalPageShell>
  );
}
