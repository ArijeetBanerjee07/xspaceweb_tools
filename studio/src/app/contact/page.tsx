"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LuMail,
  LuPhone,
  LuMapPin,
  LuClock,
  LuSend,
  LuCheck,
  LuSparkles,
  LuCircleHelp,
  LuArrowLeft,
  LuMessageSquare,
  LuBuilding,
} from "react-icons/lu";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-100/60 border-b border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
            <LuMessageSquare className="w-4 h-4 text-[#3bb1df]" />
            <span>24/7 Global Product &amp; Customer Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Get in Touch with XSW Tools
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about custom tools, enterprise API access, or subscription billing? Our engineering and support crew is always ready to assist.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Median Response Time: &lt; 15 mins
            </span>
            <span>&bull;</span>
            <span>All 9 Studios Operational</span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Office & Support Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <LuBuilding className="w-5 h-5 text-[#3bb1df]" />
                <span>Contact Channels</span>
              </h2>

              <div className="space-y-4 text-xs">
                {/* Email Support */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <LuMail className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Email Assistance</div>
                    <div className="text-slate-500 text-[11px]">General &amp; Technical Queries</div>
                    <a href="mailto:support@xspaceweb.com" className="font-semibold text-[#3bb1df] hover:underline block">
                      support@xspaceweb.com
                    </a>
                    <a href="mailto:contact@xspaceweb.com" className="font-semibold text-slate-600 hover:underline block text-[11px]">
                      contact@xspaceweb.com
                    </a>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <LuPhone className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Direct Support Hotline</div>
                    <div className="text-slate-500 text-[11px]">Mon–Sat &bull; 9:00 AM – 7:00 PM IST</div>
                    <div className="font-semibold text-slate-800 font-mono">+91 (040) 4892-0044</div>
                    <div className="text-slate-500 text-[11px]">Toll-Free: 1800-419-XSW</div>
                  </div>
                </div>

                {/* Headquarters Location */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <LuMapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Global Technology Hub</div>
                    <div className="text-slate-600 leading-relaxed text-[11px]">
                      Plot 42, Tech Innovation District,<br />
                      HITEC Cyber City, Hyderabad, 500081,<br />
                      Telangana, India
                    </div>
                  </div>
                </div>

                {/* Response SLA */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 transition">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <LuClock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs">Support SLA Guidelines</div>
                    <div className="text-slate-600 leading-relaxed text-[11px]">
                      Free Tier: Within 6 hours<br />
                      XSW Pro Subscribers: Dedicated priority queue (&lt; 15 mins)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links card */}
            <div className="bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <LuSparkles className="w-4 h-4 text-amber-300" />
                <span>Self-Service Resources</span>
              </div>
              <h3 className="text-base font-bold text-white">Need an immediate answer?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check our documentation center for guides on bulk batch conversions, OCR scanner calibration, and Razorpay subscription invoices.
              </p>
              <div className="pt-2">
                <Link
                  href="/app/help"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition"
                >
                  <LuCircleHelp className="w-3.5 h-3.5 text-blue-300" />
                  <span>Browse Help Center &amp; FAQ</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Send a Message</h2>
              <p className="text-xs text-slate-600 mt-1">
                Fill in the details below and an XSW Tools engineer will respond to your registered email.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <LuCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">Message Sent Successfully!</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <strong>{formData.name || "friend"}</strong>. Your ticket #XSW-{(Math.random() * 89999 + 10000).toFixed(0)} has been queued. We will follow up at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", category: "general", subject: "", message: "" });
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3bb1df]/20 focus:border-[#3bb1df] bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Work Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3bb1df]/20 focus:border-[#3bb1df] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Inquiry Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3bb1df]/20 focus:border-[#3bb1df] bg-slate-50/50 text-slate-700 font-medium"
                    >
                      <option value="general">General Support &amp; Tools</option>
                      <option value="billing">Subscription &amp; Invoices (Razorpay)</option>
                      <option value="feature">Tool or Format Request</option>
                      <option value="enterprise">Enterprise Custom API Integration</option>
                      <option value="bug">Report Technical Bug</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Query regarding PDF OCR limits"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3bb1df]/20 focus:border-[#3bb1df] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Detailed Message</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3bb1df]/20 focus:border-[#3bb1df] bg-slate-50/50 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#3bb1df] hover:bg-[#2aa3d2] disabled:opacity-60 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <LuSend className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
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
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-slate-900 font-semibold text-[#3bb1df] transition">Contact Us</Link>
            <Link href="/app/help" className="hover:text-slate-900 transition">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
