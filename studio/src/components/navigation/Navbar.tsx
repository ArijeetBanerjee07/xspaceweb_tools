"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuSearch,
  LuChevronDown,
  LuChevronRight,
  LuLayoutGrid,
  LuX,
  LuMenu,
  LuFolderTree,
  LuSparkles,
  LuArrowRightLeft,
  LuFileText,
  LuPencil,
  LuShieldCheck,
  LuBot,
  LuArrowRight,
} from "react-icons/lu";
import { MEGA_MENU_CATEGORIES, getToolLink, AI_TOOL_SLUGS } from "@/config/publicTools";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isAuthenticated);
  const navRef = useRef<HTMLDivElement>(null);

  // Sync session client-side
  useEffect(() => {
    setIsUserLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.id || data?.user?.email) {
          setIsUserLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    "PDF Organization": <LuFolderTree className="w-4 h-4 text-rose-500" />,
    "Optimize & OCR": <LuSparkles className="w-4 h-4 text-emerald-500" />,
    "Convert to PDF": <LuArrowRightLeft className="w-4 h-4 text-amber-500" />,
    "Convert from PDF": <LuFileText className="w-4 h-4 text-blue-500" />,
    "Edit PDF": <LuPencil className="w-4 h-4 text-purple-500" />,
    "Security": <LuShieldCheck className="w-4 h-4 text-sky-500" />,
    "AI & More": <LuBot className="w-4 h-4 text-pink-500" />,
    "Convert with Images": <LuArrowRightLeft className="w-4 h-4 text-amber-500" />,
    "Image & Layout Editing": <LuPencil className="w-4 h-4 text-purple-500" />,
  };

  const getCategoriesForMenu = () => {
    if (activeMenu === "convert") {
      return MEGA_MENU_CATEGORIES.filter(
        (c) => c.name === "Convert to PDF" || c.name === "Convert from PDF"
      );
    }
    if (activeMenu === "ai") {
      return MEGA_MENU_CATEGORIES.filter((c) => c.name === "AI & More");
    }
    if (activeMenu === "image") {
      return [
        {
          name: "Convert with Images",
          count: 5,
          color: "text-amber-500",
          bg: "bg-amber-50",
          tools: [
            { slug: "image-converter", name: "Image Conversion" },
            { slug: "jpg-to-pdf", name: "JPG to PDF" },
            { slug: "pdf-to-jpg", name: "PDF to JPG" },
            { slug: "image-upscaler", name: "Image Upscaler" },
            { slug: "scan-to-pdf", name: "Scan to PDF" },
          ],
        },
        {
          name: "Image & Layout Editing",
          count: 4,
          color: "text-purple-500",
          bg: "bg-purple-50",
          tools: [
            { slug: "crop-pdf", name: "Crop PDF" },
            { slug: "add-watermark", name: "Add Watermark" },
            { slug: "mark-pdf", name: "Edit PDF" },
            { slug: "organize-pdf", name: "Organize PDF" },
          ],
        },
      ];
    }
    if (activeMenu === "pdf") {
      return MEGA_MENU_CATEGORIES.filter((c) =>
        ["PDF Organization", "Optimize & OCR", "Edit PDF", "Security"].includes(c.name)
      );
    }
    return MEGA_MENU_CATEGORIES;
  };

  const displayedCategories = getCategoriesForMenu();

  const allToolsFlat = [
    ...MEGA_MENU_CATEGORIES.flatMap((c) =>
      c.tools.map((t) => ({ ...t, category: c.name }))
    ),
    { slug: "image-converter", name: "Image Conversion", category: "Convert with Images" },
  ];

  const filteredTools = searchQuery.trim()
    ? allToolsFlat.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div ref={navRef} className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* LEFT: BRAND LOGO */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group shrink-0 py-1">
            <img
              src="/logo-full.png?v=10"
              alt="XSWTOOLS - Every Tool. One Workspace."
              className="h-10 sm:h-11 md:h-12 w-auto object-contain group-hover:opacity-95 transition-opacity"
            />
          </Link>

          {/* DESKTOP NAV DROPDOWN BUTTONS */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* PDFStudio Dropdown */}
            <button
              type="button"
              onClick={() => toggleMenu("pdf")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "pdf"
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span>PDFStudio</span>
              <LuChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "pdf" ? "rotate-180 text-blue-600" : "text-slate-400"
                }`}
              />
            </button>

            {/* AI Tools */}
            <button
              type="button"
              onClick={() => toggleMenu("ai")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "ai"
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span>AI Tools</span>
              <LuChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "ai" ? "rotate-180 text-blue-600" : "text-slate-400"
                }`}
              />
            </button>

            {/* Image Tools */}
            <button
              type="button"
              onClick={() => toggleMenu("image")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "image"
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span>Image Tools</span>
              <LuChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "image" ? "rotate-180 text-blue-600" : "text-slate-400"
                }`}
              />
            </button>

            {/* Convert Files */}
            <button
              type="button"
              onClick={() => toggleMenu("convert")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "convert"
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span>Convert Files</span>
              <LuChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "convert" ? "rotate-180 text-blue-600" : "text-slate-400"
                }`}
              />
            </button>

            {/* All Tools */}
            <button
              type="button"
              onClick={() => toggleMenu("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeMenu === "all"
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span>All Tools</span>
              <LuChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "all" ? "rotate-180 text-blue-600" : "text-slate-400"
                }`}
              />
            </button>
          </nav>
        </div>

        {/* RIGHT: SEARCH, AUTH ACTIONS & 9-DOT LAUNCHER */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search all tools"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <LuSearch className="w-5 h-5" />
          </button>

          {isUserLoggedIn ? (
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1c1d22] hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
            >
              <span>Workspace</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-5 py-2 rounded-full bg-[#1c1d22] hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
              >
                Get started
              </Link>
            </>
          )}

          {/* 9-Dot Apps Launcher */}
          <Link
            href="/app"
            title="Launch all studios"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition ml-0.5 cursor-pointer"
          >
            <LuLayoutGrid className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {isMobileMenuOpen ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ================= MEGA-MENU DROPDOWN ================= */}
      {activeMenu && (
        <div className="hidden lg:block absolute top-full left-0 w-full bg-white border-b border-slate-200/90 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          <div className="max-w-[1440px] mx-auto p-6 xl:p-8">
            <div
              className={
                displayedCategories.length === 1
                  ? "grid grid-cols-1 max-w-md mx-auto"
                  : displayedCategories.length === 2
                  ? "grid grid-cols-2 max-w-3xl mx-auto gap-8 xl:gap-12"
                  : displayedCategories.length <= 4
                  ? "grid grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto gap-6"
                  : "grid grid-cols-7 gap-4 xl:gap-6"
              }
            >
              {displayedCategories.map((category) => (
                <div key={category.name} className="flex flex-col space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="p-1 rounded-md bg-slate-50">
                      {categoryIcons[category.name]}
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-900 leading-tight">
                        {category.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {category.count} tools
                      </span>
                    </div>
                  </div>

                  {/* Tool List */}
                  <div className="flex flex-col space-y-0.5">
                    {category.tools.map((tool) => {
                      const isAi = AI_TOOL_SLUGS.has(tool.slug);
                      const href = getToolLink(tool.slug, isUserLoggedIn);
                      return (
                        <Link
                          key={tool.slug}
                          href={href}
                          onClick={() => setActiveMenu(null)}
                          className="group flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-blue-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs text-slate-700 font-medium group-hover:text-blue-600 group-hover:font-semibold transition-colors truncate">
                              {tool.name}
                            </span>
                            {isAi && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-pink-50 text-pink-600 border border-pink-200/80 shrink-0">
                                PRO
                              </span>
                            )}
                          </div>
                          <LuChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Footer banner inside mega menu */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                All 40+ tools are free to use client-side with complete privacy &amp; zero file retention.
              </span>
              <Link
                href="/app"
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Launch Full Workspace</span>
                <LuChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE ACCORDION MENU ================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 max-h-[80vh] overflow-y-auto space-y-6">
          {MEGA_MENU_CATEGORIES.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1">
                {categoryIcons[category.name]}
                <span>{category.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {category.tools.map((tool) => {
                  const isAi = AI_TOOL_SLUGS.has(tool.slug);
                  const href = getToolLink(tool.slug, isUserLoggedIn);
                  return (
                    <Link
                      key={tool.slug}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50 py-1.5 px-2 rounded-md truncate font-medium flex items-center justify-between gap-1"
                    >
                      <span className="truncate">{tool.name}</span>
                      {isAi && (
                        <span className="text-[8px] font-bold px-1 rounded bg-pink-50 text-pink-600 border border-pink-200 shrink-0">
                          PRO
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-xs"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}

      {/* ================= QUICK SEARCH MODAL ================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <LuSearch className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search any tool (e.g. merge, compress, jpg to pdf, watermark)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {searchQuery.trim() === "" ? (
                <div className="p-4 text-xs text-slate-400 text-center">
                  Type a tool name, document format, or operation to jump instantly.
                </div>
              ) : filteredTools.length === 0 ? (
                <div className="p-6 text-xs text-slate-500 text-center">
                  No matching tools found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredTools.map((tool) => {
                  const isAi = AI_TOOL_SLUGS.has(tool.slug);
                  const href = getToolLink(tool.slug, isUserLoggedIn);
                  return (
                    <Link
                      key={tool.slug}
                      href={href}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-600 transition"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold text-sm">{tool.name}</div>
                          <div className="text-[11px] text-slate-400">{tool.category}</div>
                        </div>
                        {isAi && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-200">
                            PRO
                          </span>
                        )}
                      </div>
                      <LuChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
