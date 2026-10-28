"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa6";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <Link href="/" className="group inline-flex items-center py-1">
              <img
                src="/logo-full.webp"
                alt="XSWTOOLS - Every Tool. One Workspace."
                width={180}
                height={56}
                loading="lazy"
                className="h-12 w-auto object-contain transition-opacity group-hover:opacity-95 sm:h-14"
              />
            </Link>

            <p className="max-w-md text-xs text-slate-600 sm:text-sm">
              Get the latest tools, AI features and guides delivered to your inbox.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                alert("Thank you for subscribing!");
              }}
              className="flex max-w-md flex-col items-stretch gap-2 xs:flex-row xs:items-center"
            >
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address for newsletter"
                required
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0066ff] focus:outline-none"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-full bg-[#1c1d22] px-6 py-2.5 text-center text-xs font-bold text-white shadow-xs transition hover:bg-black"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-6">
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
                Navigation
              </h2>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/" className="transition hover:text-[#0066ff]">Home</Link></li>
                <li><Link href="/about" className="transition hover:text-[#0066ff]">About Us</Link></li>
                <li><Link href="/#tools" className="transition hover:text-[#0066ff]">All Tools</Link></li>
                <li><Link href="/#studios" className="transition hover:text-[#0066ff]">Studios</Link></li>
                <li><Link href="/help" className="transition hover:text-[#0066ff]">Help &amp; FAQs</Link></li>
                <li><Link href="/contact" className="transition hover:text-[#0066ff]">Contact Us</Link></li>
                <li><Link href="/imprint" className="transition hover:text-[#0066ff]">Imprint</Link></li>
                <li>
                  <Link href="/partnerships" className="transition hover:text-[#0066ff]">
                    Press &amp; Partnerships
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
                Tools
              </h2>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link href="/app/studios/pdf" className="transition hover:text-[#0066ff]">PDF Studio</Link></li>
                <li><Link href="/app/studios/ai-document" className="transition hover:text-[#0066ff]">AI Tools</Link></li>
                <li><Link href="/app/studios/office" className="transition hover:text-[#0066ff]">Productivity</Link></li>
                <li><Link href="/app/studios/security" className="transition hover:text-[#0066ff]">Security</Link></li>
                <li><Link href="/app/studios/qr-link" className="transition hover:text-[#0066ff]">QR &amp; Link Studio</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 XSPACEWEB Studio. All rights reserved.</p>

          <nav aria-label="Legal links" className="flex items-center gap-3">
            <Link href="/privacy" className="transition hover:text-slate-900">Privacy Policy</Link>
            <span aria-hidden="true">•</span>
            <Link href="/terms" className="transition hover:text-slate-900">Terms of Service</Link>
          </nav>

          <nav aria-label="Social media" className="flex items-center gap-3 text-slate-600">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="XSW Tools on YouTube" className="p-1 transition hover:text-red-600">
              <FaYoutube className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="XSW Tools on LinkedIn" className="p-1 transition hover:text-blue-700">
              <FaLinkedinIn className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="XSW Tools on X (formerly Twitter)" className="p-1 transition hover:text-slate-900">
              <FaXTwitter className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="XSW Tools on Instagram" className="p-1 transition hover:text-pink-600">
              <FaInstagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="XSW Tools on Facebook" className="p-1 transition hover:text-blue-600">
              <FaFacebookF className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>

        <div className="pointer-events-none select-none pt-6 text-center text-6xl font-black uppercase tracking-widest text-slate-900/[0.03] sm:text-8xl">
          XSWTOOLS
        </div>
      </div>
    </footer>
  );
}
