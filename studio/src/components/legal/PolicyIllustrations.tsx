import React from "react";
import {
  LuShield,
  LuLock,
  LuCheck,
  LuFileText,
  LuDatabase,
  LuCloud,
  LuImage,
  LuFolder,
  LuCookie,
  LuSlidersHorizontal,
  LuChartBar,
  LuSettings,
  LuLink2,
} from "react-icons/lu";

interface PolicyIllustrationProps {
  type: "privacy" | "data-safety" | "terms" | "cookies";
}

export function PolicyIllustration({ type }: PolicyIllustrationProps) {
  if (type === "privacy") {
    // Matches Image 4: Shield with keyhole, orbiting doc badges, floating pill "Your files. Your control. Always."
    return (
      <div className="relative w-full max-w-sm sm:max-w-md h-64 sm:h-72 flex items-center justify-center select-none">
        {/* Soft radial background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/60 via-sky-50/50 to-indigo-100/40 rounded-3xl blur-xl -z-10" />

        {/* Orbit circle */}
        <div className="absolute w-56 sm:w-64 h-56 sm:h-64 rounded-full border border-dashed border-blue-200/80 animate-[spin_60s_linear_infinite]" />

        {/* Floating pill: "Your files. Your control. Always." */}
        <div className="absolute top-2 right-2 sm:right-4 bg-white/95 backdrop-blur-xs border border-blue-100 rounded-2xl py-2 px-3 shadow-md text-left z-10 animate-in fade-in slide-in-from-top-2">
          <div className="text-[11px] font-bold text-slate-800 leading-tight">Your files.</div>
          <div className="text-[11px] font-bold text-blue-600 leading-tight">Your control.</div>
          <div className="text-[10px] font-semibold text-slate-400">Always.</div>
        </div>

        {/* Floating Badges */}
        {/* Red PDF Icon (top left) */}
        <div className="absolute top-8 left-6 w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 shadow-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-transform">
          <LuFileText className="w-5 h-5" />
        </div>

        {/* Green Image Icon (top center-left) */}
        <div className="absolute top-4 left-24 w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600">
          <LuImage className="w-4 h-4" />
        </div>

        {/* Blue Grid Icon (middle left) */}
        <div className="absolute top-20 left-12 w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-center text-blue-600">
          <div className="grid grid-cols-2 gap-0.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
          </div>
        </div>

        {/* Blue Text Document (bottom left) */}
        <div className="absolute bottom-10 left-16 w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 shadow-sm flex items-center justify-center text-sky-600">
          <LuFileText className="w-4 h-4" />
        </div>

        {/* Small blue shield (bottom right) */}
        <div className="absolute bottom-8 right-12 w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-center text-blue-600">
          <LuShield className="w-4 h-4" />
        </div>

        {/* Central Main Shield */}
        <div className="relative w-28 sm:w-32 h-36 sm:h-40 flex items-center justify-center">
          {/* Shield SVG with soft gradients */}
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="shieldGradPrivacy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="shieldInnerPrivacy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Outer Shield */}
            <path
              d="M50 5 L90 20 C90 65 50 110 50 115 C50 110 10 65 10 20 Z"
              fill="url(#shieldGradPrivacy)"
              stroke="#60a5fa"
              strokeWidth="2"
            />
            {/* Inner Shield Overlay */}
            <path
              d="M50 15 L80 27 C80 62 50 98 50 103 C50 98 20 62 20 27 Z"
              fill="url(#shieldInnerPrivacy)"
            />
          </svg>

          {/* Center Lock inside Shield */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-blue-600">
              <LuLock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "data-safety") {
    // Matches Image 1: Central blue shield with keyhole and connected orbital dotted lines with 4 orbiting icons (Red file, Green photo, Purple cloud, Blue database)
    return (
      <div className="relative w-full max-w-sm sm:max-w-md h-64 sm:h-72 flex items-center justify-center select-none">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/60 via-blue-50/50 to-emerald-100/40 rounded-3xl blur-xl -z-10" />

        {/* Orbit Ring with dotted path */}
        <div className="absolute w-56 sm:w-64 h-56 sm:h-64 rounded-full border border-dashed border-blue-200/90" />

        {/* Top Node: Red File */}
        <div className="absolute -top-1 sm:top-1 w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 shadow-sm flex items-center justify-center text-rose-500">
          <LuFileText className="w-4 h-4" />
        </div>

        {/* Right Node: Green Photo */}
        <div className="absolute right-4 sm:right-6 top-8 w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600">
          <LuImage className="w-4 h-4" />
        </div>

        {/* Bottom Node: Blue Database */}
        <div className="absolute bottom-8 right-6 w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 shadow-sm flex items-center justify-center text-sky-600">
          <LuDatabase className="w-4 h-4" />
        </div>

        {/* Left Node: Purple Cloud */}
        <div className="absolute left-4 sm:left-6 bottom-12 w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 shadow-sm flex items-center justify-center text-purple-600">
          <LuCloud className="w-4 h-4" />
        </div>

        {/* Center Main Shield */}
        <div className="relative w-28 sm:w-32 h-36 sm:h-40 flex items-center justify-center">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xl">
            <defs>
              <linearGradient id="shieldGradDataSafety" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="shieldInnerDS" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M50 5 L90 20 C90 65 50 110 50 115 C50 110 10 65 10 20 Z"
              fill="url(#shieldGradDataSafety)"
              stroke="#60a5fa"
              strokeWidth="2"
            />
            <path
              d="M50 15 L80 27 C80 62 50 98 50 103 C50 98 20 62 20 27 Z"
              fill="url(#shieldInnerDS)"
            />
          </svg>

          {/* Keyhole inside Shield */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-blue-600">
              <LuLock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "cookies") {
    // Matches Image 2: Browser window with cookie icon, toggles, bar graph, floating shield & gear
    return (
      <div className="relative w-full max-w-sm sm:max-w-md h-64 sm:h-72 flex items-center justify-center select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/60 via-blue-50/50 to-indigo-100/40 rounded-3xl blur-xl -z-10" />

        {/* Floating Icons */}
        <div className="absolute top-6 left-6 w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-center text-blue-600">
          <LuLock className="w-4 h-4" />
        </div>
        <div className="absolute top-4 right-10 w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600">
          <LuSettings className="w-4 h-4" />
        </div>
        <div className="absolute bottom-10 left-12 w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 shadow-sm flex items-center justify-center text-sky-600">
          <LuChartBar className="w-4 h-4" />
        </div>
        <div className="absolute bottom-6 right-8 w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-center text-blue-600">
          <LuShield className="w-4 h-4" />
        </div>

        {/* Central Browser Mockup Card */}
        <div className="w-56 sm:w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-3.5 space-y-3">
          {/* Browser Header Bar */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="ml-2 flex-1 h-3 rounded-full bg-slate-100" />
          </div>

          {/* Browser Content */}
          <div className="flex items-center gap-3">
            {/* Cookie Graphic */}
            <div className="w-12 h-12 rounded-full bg-blue-500 shadow-md flex items-center justify-center text-white shrink-0 relative overflow-hidden">
              <LuCookie className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/30" />
            </div>

            {/* Skeleton toggles & lines */}
            <div className="flex-1 space-y-2">
              <div className="w-full h-2 rounded-full bg-slate-200" />
              <div className="w-3/4 h-2 rounded-full bg-slate-100" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] font-bold text-slate-400">Strictly Necessary</span>
                <span className="w-6 h-3.5 rounded-full bg-blue-600 flex items-center justify-end px-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                </span>
              </div>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600">
              <LuCheck className="w-3 h-3" /> Encrypted Session
            </span>
            <span className="text-slate-400">0 Third-Party Ads</span>
          </div>
        </div>
      </div>
    );
  }

  // Terms & Conditions (Image 3): Legal Document with lines, checkmark badge, red file, blue grid, green image, orange link
  return (
    <div className="relative w-full max-w-sm sm:max-w-md h-64 sm:h-72 flex items-center justify-center select-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/60 via-slate-50/50 to-indigo-100/40 rounded-3xl blur-xl -z-10" />

      {/* Floating Icons */}
      <div className="absolute top-6 left-8 w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 shadow-sm flex items-center justify-center text-rose-500">
        <LuFileText className="w-4 h-4" />
      </div>
      <div className="absolute top-4 right-10 w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-600">
        <LuImage className="w-4 h-4" />
      </div>
      <div className="absolute bottom-8 left-10 w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 shadow-sm flex items-center justify-center text-blue-600">
        <div className="grid grid-cols-2 gap-0.5">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-xs" />
        </div>
      </div>
      <div className="absolute bottom-6 right-8 w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 shadow-sm flex items-center justify-center text-amber-600">
        <LuLink2 className="w-4 h-4" />
      </div>

      {/* Central Legal Document Card */}
      <div className="w-52 sm:w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-5 space-y-2.5 relative">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
          <LuFileText className="w-4 h-4" />
        </div>

        {/* Document Skeleton Lines */}
        <div className="w-full h-2.5 rounded-full bg-slate-200" />
        <div className="w-5/6 h-2 rounded-full bg-slate-100" />
        <div className="w-4/6 h-2 rounded-full bg-slate-100" />
        <div className="w-full h-2 rounded-full bg-slate-100" />
        <div className="w-3/5 h-2 rounded-full bg-slate-100" />

        {/* Large Checkmark Badge Stamp on Document */}
        <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-blue-600 shadow-lg flex items-center justify-center text-white border-2 border-white">
          <LuCheck className="w-8 h-8 stroke-[3]" />
        </div>
      </div>
    </div>
  );
}
