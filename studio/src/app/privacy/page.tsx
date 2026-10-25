import type { Metadata } from "next";
import Link from "next/link";
import {
  LuShieldCheck,
  LuLock,
  LuDatabase,
  LuClock,
  LuTrash2,
  LuFileText,
  LuKey,
  LuMail,
  LuArrowLeft,
  LuCheck,
} from "react-icons/lu";

export const metadata: Metadata = {
  title: "Privacy Policy | XSW Tools",
  description:
    "Learn how XSW Tools protects your data with zero permanent retention, client-side encryption, and strict GDPR/DPDP compliance.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 24, 2026";

  const pillars = [
    {
      icon: LuTrash2,
      title: "Ephemeral Processing",
      desc: "Uploaded files are processed in isolated memory buffers and purged automatically within 60 minutes or immediately upon job completion.",
    },
    {
      icon: LuLock,
      title: "Zero Content Storage",
      desc: "We never inspect, train AI models on, or resell the contents of your PDFs, spreadsheets, documents, or images.",
    },
    {
      icon: LuShieldCheck,
      title: "Bank-Grade Encryption",
      desc: "All transfers are encrypted via TLS 1.3 in transit and AES-256 for temporary storage tokens with restricted access controls.",
    },
    {
      icon: LuKey,
      title: "BYOK Key Isolation",
      desc: "Custom external API keys (OpenAI, Gemini) remain isolated in your encrypted session store and are never exposed to other tenants.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/brand/xswtools_logo.png"
              alt="xswtools"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">xswtools</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl transition"
            >
              <LuArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] text-white font-bold text-xs shadow-sm transition"
            >
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-100/60 border-b border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <LuShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy-First Architecture &bull; Strict Zero Data Retention</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your trust is our foundation. XSW Tools operates on an ephemeral processing standard designed so that your sensitive files belong solely to you.
          </p>
          <div className="text-xs font-semibold text-slate-400 font-mono">
            Last Updated: {lastUpdated} &bull; Effective Globally
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 hover:border-blue-300 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3bb1df] flex items-center justify-center font-bold">
                <pillar.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Section Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-700">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-mono">1</span>
              <span>Introduction &amp; Scope</span>
            </h2>
            <p>
              This Privacy Policy explains how <strong>XSW Tools</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) handles personal data and digital files when you interact with our website, APIs, and suite of 9 web studios (PDF Studio, AI Document Studio, Background Studio, Document Hub, Security &amp; E-Signature, Office Studio, Compress &amp; Enhance, QR &amp; Link Studio, and TrendRank AI).
            </p>
            <p>
              By accessing or using XSW Tools, you consent to the processing routines outlined here in compliance with applicable international data privacy standards, including the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and the Digital Personal Data Protection Act (DPDP).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-mono">2</span>
              <span>Information We Collect</span>
            </h2>
            <p>We purposefully minimize data collection to the absolute operational baseline:</p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2">
                <LuCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Account Information:</strong> If you register, we store your email address, encrypted authentication password hash, name, and subscription tier.</span>
              </li>
              <li className="flex items-start gap-2">
                <LuCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Usage Metrics:</strong> Number of conversions executed, timestamps, and bandwidth consumed for billing and rate-limiting enforcement.</span>
              </li>
              <li className="flex items-start gap-2">
                <LuCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Document Payloads:</strong> Files uploaded for conversion, signing, compression, or analysis. <em>These are never retained permanently and are destroyed post-execution.</em></span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-mono">3</span>
              <span>Automated File Destruction Pipeline</span>
            </h2>
            <p>
              When you submit a file to any studio:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>Your file is transmitted over TLS 1.3 directly to an isolated ephemeral worker instance.</li>
              <li>Processing occurs in RAM buffers. If temporary disk staging is necessary (e.g. large raster compression), it is written to an encrypted ephemeral scratch volume.</li>
              <li>Once the processed file is downloaded or 60 minutes elapse (whichever occurs first), all copies and intermediate artifacts are permanently purged via cryptographic deletion.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-mono">4</span>
              <span>Payment &amp; Financial Security</span>
            </h2>
            <p>
              All financial transactions, invoices, and payment card interactions are processed through Razorpay, an RBI-authorized and PCI-DSS Level 1 certified payment aggregator.
            </p>
            <p>
              <strong>XSW Tools never receives, stores, or sees your credit card number, CVV, or bank account credentials.</strong> Payments use tokenized end-to-end encryption.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-mono">5</span>
              <span>Your Rights &amp; Data Control</span>
            </h2>
            <p>
              Regardless of your geographical location, XSW Tools grants you full ownership over your account:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Right to Rectification:</strong> Edit your name, profile, and settings anytime.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Delete your workspace and all corresponding logs instantly with one click from Account Settings.</li>
              <li><strong>Data Portability:</strong> Export your conversion histories and invoices in standard JSON or CSV format.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-center font-mono">6</span>
              <span>Contact Our Privacy Team</span>
            </h2>
            <p>
              If you have any questions, privacy inquiries, or data access requests regarding this policy, please reach out to our dedicated privacy officers:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <div className="font-bold text-slate-900">XSW Tools Data Protection Officer</div>
              <div>Email: <a href="mailto:privacy@xspaceweb.com" className="text-[#3bb1df] hover:underline">privacy@xspaceweb.com</a></div>
              <div>Support: <a href="mailto:support@xspaceweb.com" className="text-[#3bb1df] hover:underline">support@xspaceweb.com</a></div>
              <div>Address: Plot 42, Tech Innovation District, Cyber City, Hyderabad, 500081, India</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/brand/xswtools_logo.png" alt="xswtools" className="h-5 w-auto object-contain" />
            <span className="font-bold text-slate-900">xswtools</span>
            <span className="font-semibold text-slate-700">&bull; &copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            <Link href="/privacy" className="hover:text-slate-900 font-semibold text-[#3bb1df] transition">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact Us</Link>
            <Link href="/app/help" className="hover:text-slate-900 transition">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
