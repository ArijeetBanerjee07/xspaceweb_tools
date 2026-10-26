"use client";

import React, { useState, useRef, useEffect } from "react";
import { LuChevronDown, LuCheck } from "react-icons/lu";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (CustomSelectOption | string)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className = "",
  variant = "light",
  size = "md",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isDark = variant === "dark";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full select-none text-left ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 transition-all duration-150 rounded-xl font-medium outline-none cursor-pointer ${
          size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-xs sm:text-sm"
        } ${
          isDark
            ? "bg-slate-800/90 text-slate-100 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 focus:border-indigo-500 shadow-sm"
            : "bg-white text-slate-800 border border-slate-200/90 hover:border-blue-300 hover:bg-slate-50/50 focus:border-blue-500 shadow-xs"
        } ${
          isOpen
            ? isDark
              ? "ring-2 ring-indigo-500/30 border-indigo-500"
              : "ring-2 ring-blue-500/20 border-blue-500 shadow-sm"
            : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? "" : "text-slate-400 font-normal"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <LuChevronDown
          className={`shrink-0 w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-slate-400" : "text-slate-500"}`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden shadow-xl border backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${
            isDark
              ? "bg-slate-800/98 border-slate-700/90 text-slate-100 divide-y divide-slate-700/40"
              : "bg-white/98 border-slate-200/90 text-slate-800 divide-y divide-slate-100"
          }`}
          style={{ minWidth: "100%", maxHeight: "260px" }}
        >
          <div className="py-1 overflow-y-auto max-h-[250px] scrollbar-thin">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-xs sm:text-sm"
                  } ${
                    isSelected
                      ? isDark
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                        : "bg-blue-50/80 text-blue-700 font-semibold"
                      : isDark
                      ? "hover:bg-slate-700/60 text-slate-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {opt.description && (
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        {opt.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <LuCheck
                      className={`shrink-0 w-3.5 h-3.5 ${
                        isDark ? "text-indigo-400" : "text-blue-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
