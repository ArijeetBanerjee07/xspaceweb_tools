// XSW Tools: Official Feature Gating & Monetization Engine
// Implements exact blueprint across all 9 studios: Free (unlimited), Limited (quotas), and Pro (paid).

export type StudioId =
  | "pdf"
  | "ai-document"
  | "document-hub"
  | "security"
  | "qr-link"
  | "background"
  | "office"
  | "compress"
  | "trendrank";

export type FeatureTier = "free_unlimited" | "free_quota" | "pro_exclusive";

export interface ToolGatingRule {
  id: string;
  name: string;
  studio: StudioId;
  tier: FeatureTier;
  freeLimit?: number; // defined if tier === 'free_quota'
  proLimit?: number | "unlimited";
  description: string;
}

export const GATING_RULES: Record<string, ToolGatingRule> = {
  // -------------------------------------------------------------
  // 1. PDF Studio
  // -------------------------------------------------------------
  // 100% Free conversions & operations
  "pdf:convert": {
    id: "pdf:convert",
    name: "PDF Format Conversions",
    studio: "pdf",
    tier: "free_unlimited",
    description: "PDF to Word, Excel, PPT, Images and vice-versa",
  },
  "pdf:page-ops": {
    id: "pdf:page-ops",
    name: "PDF Page Operations",
    studio: "pdf",
    tier: "free_unlimited",
    description: "Merge, split, extract, delete, duplicate, insert, and reorder pages",
  },
  "pdf:visual-edits": {
    id: "pdf:visual-edits",
    name: "PDF Visual Edits",
    studio: "pdf",
    tier: "free_unlimited",
    description: "Rotate, crop, and resize PDF pages",
  },
  "pdf:compress": {
    id: "pdf:compress",
    name: "PDF Compression",
    studio: "pdf",
    tier: "free_unlimited",
    description: "Smart compress, compress to 100KB, 1MB, or HQ",
  },
  // Free Quotas
  "pdf:watermark": {
    id: "pdf:watermark",
    name: "Add Watermark",
    studio: "pdf",
    tier: "free_quota",
    freeLimit: 5,
    proLimit: "unlimited",
    description: "Free for first 5 documents, then gated to Pro",
  },
  "pdf:encrypt": {
    id: "pdf:encrypt",
    name: "PDF Password Lock & Encrypt",
    studio: "pdf",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Free for first 3 documents (6 lock/unlock operations)",
  },
  // Pro Exclusive
  "pdf:edit-overlays": {
    id: "pdf:edit-overlays",
    name: "Add Custom Text / Image Overlays",
    studio: "pdf",
    tier: "pro_exclusive",
    description: "Full text styling, badge stamping, and image overlays",
  },
  "pdf:page-numbering": {
    id: "pdf:page-numbering",
    name: "Custom Page Numbering",
    studio: "pdf",
    tier: "pro_exclusive",
    description: "Header/footer stamping and custom page number sequencer",
  },
  "pdf:organizer": {
    id: "pdf:organizer",
    name: "Advanced PDF Organizer",
    studio: "pdf",
    tier: "free_unlimited",
    description: "Multi-document visual page matrix arranger",
  },

  // -------------------------------------------------------------
  // 2. AI Document Studio
  // -------------------------------------------------------------
  // 100% Free
  "ai-doc:summarizer": {
    id: "ai-doc:summarizer",
    name: "Document Summarizer",
    studio: "ai-document",
    tier: "free_unlimited",
    description: "Instant bulleted summaries and executive abstracts",
  },
  "ai-doc:invoice-extract": {
    id: "ai-doc:invoice-extract",
    name: "Invoice & Receipt Extraction",
    studio: "ai-document",
    tier: "free_unlimited",
    description: "Parses invoices, receipts, and tax line items into structured data",
  },
  "ai-doc:qa": {
    id: "ai-doc:qa",
    name: "Document Q&A",
    studio: "ai-document",
    tier: "free_unlimited",
    description: "Core question-answering on uploaded documents",
  },
  "ai-doc:compare": {
    id: "ai-doc:compare",
    name: "Compare Two Documents",
    studio: "ai-document",
    tier: "free_unlimited",
    description: "Side-by-side diff auditor and version comparison",
  },
  "ai-doc:export": {
    id: "ai-doc:export",
    name: "Export Extracted Data",
    studio: "ai-document",
    tier: "free_unlimited",
    description: "Free download of extracted tables and text (Markdown, JSON)",
  },
  // Pro Exclusive
  "ai-doc:chat-pdf": {
    id: "ai-doc:chat-pdf",
    name: "Chat with PDF",
    studio: "ai-document",
    tier: "pro_exclusive",
    description: "Interactive back-and-forth conversational neural agent",
  },
  "ai-doc:table-entities": {
    id: "ai-doc:table-entities",
    name: "Extract Tables & Entities",
    studio: "ai-document",
    tier: "pro_exclusive",
    description: "Deep tabular schema parsing from messy PDFs into clean Excel/CSV",
  },
  "ai-doc:rewrite": {
    id: "ai-doc:rewrite",
    name: "Rewrite & Simplify Document",
    studio: "ai-document",
    tier: "pro_exclusive",
    description: "Tone adjustment, plain-English simplification, and clause rewrites",
  },
  "ai-doc:translate": {
    id: "ai-doc:translate",
    name: "Document Translation",
    studio: "ai-document",
    tier: "pro_exclusive",
    description: "Full document language translation preserving layout",
  },

  // -------------------------------------------------------------
  // 3. Document Hub (Cloud File Manager)
  // -------------------------------------------------------------
  "doc-hub:files": {
    id: "doc-hub:files",
    name: "Cloud Storage Files",
    studio: "document-hub",
    tier: "free_quota",
    freeLimit: 5,
    proLimit: 10000,
    description: "5 files free, up to 5 GB storage on Pro",
  },
  "doc-hub:folders": {
    id: "doc-hub:folders",
    name: "Folder Hierarchy",
    studio: "document-hub",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: 1000,
    description: "3 folders free, unlimited folder hierarchy on Pro",
  },

  // -------------------------------------------------------------
  // 4. Security & E-Signature Studio
  // -------------------------------------------------------------
  "security:esign": {
    id: "security:esign",
    name: "Electronic Signature",
    studio: "security",
    tier: "free_unlimited",
    description: "Draw, type, or upload digital signatures and place them on documents",
  },
  "security:stamp": {
    id: "security:stamp",
    name: "Document Approval Stamp",
    studio: "security",
    tier: "free_unlimited",
    description: "Verified approval seals and company stamps",
  },
  "security:password-lock": {
    id: "security:password-lock",
    name: "Password Protection (AES-128)",
    studio: "security",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 PDFs (6 lock/unlock cycles) free",
  },
  "security:redaction": {
    id: "security:redaction",
    name: "True PDF Redaction",
    studio: "security",
    tier: "pro_exclusive",
    description: "Permanent cryptographic removal of confidential text, PII, and blacked-out areas",
  },

  // -------------------------------------------------------------
  // 5. QR & Link Studio
  // -------------------------------------------------------------
  "qr:generate": {
    id: "qr:generate",
    name: "Core QR Generation",
    studio: "qr-link",
    tier: "free_unlimited",
    description: "URL, Wi-Fi, vCard, Email, Calendar Events, Social links + clean PNG download",
  },
  "qr:custom-frames": {
    id: "qr:custom-frames",
    name: "Custom Design & Frames",
    studio: "qr-link",
    tier: "free_quota",
    freeLimit: 5,
    proLimit: "unlimited",
    description: "First 5 custom designs free (gradients, custom eye styles, colored frames)",
  },
  "qr:dynamic-links": {
    id: "qr:dynamic-links",
    name: "Dynamic QR Codes & Short Links",
    studio: "qr-link",
    tier: "pro_exclusive",
    description: "Edit destination URLs after printing with real-time scan analytics",
  },
  "qr:bulk-batch": {
    id: "qr:bulk-batch",
    name: "Bulk CSV & PDF Stamper",
    studio: "qr-link",
    tier: "pro_exclusive",
    description: "Upload spreadsheets to generate 250+ QRs in batch or stamp directly onto PDF pages",
  },

  // -------------------------------------------------------------
  // 6. Background Studio
  // -------------------------------------------------------------
  "bg:remover": {
    id: "bg:remover",
    name: "AI Background Remover",
    studio: "background",
    tier: "free_unlimited",
    description: "Uncapped instant cutouts with transparent PNG export",
  },
  "bg:passport-photo": {
    id: "bg:passport-photo",
    name: "Passport & Visa Photo Maker",
    studio: "background",
    tier: "free_unlimited",
    description: "Standard biometric dimension presets (2x2 in, 35x45 mm)",
  },
  "bg:signature-cutout": {
    id: "bg:signature-cutout",
    name: "Signature & Stamp Cutout",
    studio: "background",
    tier: "free_unlimited",
    description: "Transparent isolation of ink signatures from paper scans",
  },
  "bg:product-showcase": {
    id: "bg:product-showcase",
    name: "Product Showcase Studio",
    studio: "background",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "First 3 product scenes free (ecommerce backdrops, studio lighting)",
  },
  "bg:batch-processing": {
    id: "bg:batch-processing",
    name: "Batch Queue Processing",
    studio: "background",
    tier: "pro_exclusive",
    description: "Bulk background cutouts (up to 50 photos in one run)",
  },

  // -------------------------------------------------------------
  // 7. Office Studio (All 7 tools capped at 3 each on Free tier)
  // -------------------------------------------------------------
  "office:ai-doc": {
    id: "office:ai-doc",
    name: "AI-Assisted Document Creation",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 docs free, unlimited on Pro",
  },
  "office:docx-gen": {
    id: "office:docx-gen",
    name: "DOCX Word File Generator",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 docs free, unlimited on Pro",
  },
  "office:xlsx-gen": {
    id: "office:xlsx-gen",
    name: "Excel / XLSX Structured Workbook Creator",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 sheets free, unlimited on Pro",
  },
  "office:letter-gen": {
    id: "office:letter-gen",
    name: "Business Letter Generator",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 letters free, unlimited on Pro",
  },
  "office:formula-suggester": {
    id: "office:formula-suggester",
    name: "Spreadsheet Formula Assistant",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 models free, unlimited on Pro",
  },
  "office:invoice-templates": {
    id: "office:invoice-templates",
    name: "Commercial Invoice & Billing Creator",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 invoices free, unlimited on Pro",
  },
  "office:business-reports": {
    id: "office:business-reports",
    name: "Formal Business Report Compiler",
    studio: "office",
    tier: "free_quota",
    freeLimit: 3,
    proLimit: "unlimited",
    description: "Up to 3 reports free, unlimited on Pro",
  },

  // -------------------------------------------------------------
  // 8. Compress & Enhance Studio (100% Free for Everyone)
  // -------------------------------------------------------------
  "compress:all": {
    id: "compress:all",
    name: "Compress & Enhance Suite",
    studio: "compress",
    tier: "free_unlimited",
    description: "Smart compression, targeted size, resizer, AI upscaler, denoiser & format converter",
  },

  // -------------------------------------------------------------
  // 9. TrendRank AI Studio (100% Pro Exclusive)
  // -------------------------------------------------------------
  "trendrank:all": {
    id: "trendrank:all",
    name: "TrendRank AI Studio",
    studio: "trendrank",
    tier: "pro_exclusive",
    description: "Keyword intent analysis, live rank tracking, hashtag clusters, and viral AI copy",
  },
};

export interface FeatureAccessResult {
  allowed: boolean;
  tier: FeatureTier;
  isPro: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  requiresUpgrade: boolean;
  reason?: "pro_exclusive" | "quota_exceeded";
}

/**
 * Pure evaluation function: checks if a feature is accessible given plan & usage.
 */
export function evaluateFeatureAccess(
  toolKey: string,
  isPro: boolean,
  currentUsage: number = 0
): FeatureAccessResult {
  const rule = GATING_RULES[toolKey];
  if (!rule) {
    // If not specifically configured, default to allowed
    return {
      allowed: true,
      tier: "free_unlimited",
      isPro,
      currentUsage,
      limit: Infinity,
      remaining: Infinity,
      requiresUpgrade: false,
    };
  }

  if (isPro) {
    return {
      allowed: true,
      tier: rule.tier,
      isPro: true,
      currentUsage,
      limit: rule.proLimit === "unlimited" ? Infinity : (rule.proLimit ?? Infinity),
      remaining: Infinity,
      requiresUpgrade: false,
    };
  }

  // Free Tier
  if (rule.tier === "free_unlimited") {
    return {
      allowed: true,
      tier: "free_unlimited",
      isPro: false,
      currentUsage,
      limit: Infinity,
      remaining: Infinity,
      requiresUpgrade: false,
    };
  }

  if (rule.tier === "pro_exclusive") {
    return {
      allowed: false,
      tier: "pro_exclusive",
      isPro: false,
      currentUsage,
      limit: 0,
      remaining: 0,
      requiresUpgrade: true,
      reason: "pro_exclusive",
    };
  }

  // free_quota
  const freeLimit = rule.freeLimit ?? 0;
  const remaining = Math.max(0, freeLimit - currentUsage);
  const allowed = currentUsage < freeLimit;

  return {
    allowed,
    tier: "free_quota",
    isPro: false,
    currentUsage,
    limit: freeLimit,
    remaining,
    requiresUpgrade: !allowed,
    reason: allowed ? undefined : "quota_exceeded",
  };
}

// -------------------------------------------------------------
// CLIENT-SIDE LOCAL STORAGE HELPERS
// -------------------------------------------------------------
const STORAGE_PREFIX = "otk_quota_";

export function getClientUsage(toolKey: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${toolKey}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function incrementClientUsage(toolKey: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const current = getClientUsage(toolKey);
    const next = current + 1;
    localStorage.setItem(`${STORAGE_PREFIX}${toolKey}`, next.toString());
    window.dispatchEvent(new CustomEvent("otk_quota_updated", { detail: { toolKey, usage: next } }));
    return next;
  } catch {
    return 0;
  }
}

export function resetClientUsage(toolKey?: string) {
  if (typeof window === "undefined") return;
  try {
    if (toolKey) {
      localStorage.removeItem(`${STORAGE_PREFIX}${toolKey}`);
    } else {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
      keys.forEach((k) => localStorage.removeItem(k));
    }
    window.dispatchEvent(new CustomEvent("otk_quota_updated", { detail: { toolKey: "all" } }));
  } catch {
    // safe fallback
  }
}

export function checkClientFeatureAccess(toolKey: string, isPro: boolean): FeatureAccessResult {
  const usage = getClientUsage(toolKey);
  return evaluateFeatureAccess(toolKey, isPro, usage);
}

import { useState, useEffect, useCallback, useContext } from "react";
import { WorkspaceContext } from "@/lib/workspace-context";

export function useProStatus(initialPlanId?: string): boolean {
  const ws = useContext(WorkspaceContext);
  const contextIsPro = ws
    ? ws.isPro || (Boolean(ws.workspace?.planId) && ws.workspace.planId !== "free")
    : false;

  const serverDefault = contextIsPro || (Boolean(initialPlanId) && initialPlanId !== "free");
  const [isPro, setIsPro] = useState<boolean>(serverDefault);

  useEffect(() => {
    if (contextIsPro || (initialPlanId && initialPlanId !== "free")) {
      setIsPro(true);
      return;
    }

    const checkStatus = () => {
      try {
        const expiresAt = Number(localStorage.getItem("otk_pro_expires_at") || 0);
        if (expiresAt > 0 && Date.now() > expiresAt) {
          localStorage.removeItem("otk_is_pro");
          localStorage.removeItem("otk_pro_expires_at");
          setIsPro(false);
          return;
        }

        const local = localStorage.getItem("otk_is_pro") === "true";
        if (local || (initialPlanId && initialPlanId !== "free") || contextIsPro) {
          setIsPro(true);
        } else {
          setIsPro(false);
        }
      } catch {
        if (initialPlanId && initialPlanId !== "free") setIsPro(true);
      }
    };
    checkStatus();
    window.addEventListener("otk_plan_updated", checkStatus);
    window.addEventListener("storage", checkStatus);
    return () => {
      window.removeEventListener("otk_plan_updated", checkStatus);
      window.removeEventListener("storage", checkStatus);
    };
  }, [initialPlanId, contextIsPro]);

  return contextIsPro || isPro;
}

export function useToolGating(toolKey: string) {
  const isPro = useProStatus();
  const [usage, setUsage] = useState<number>(0);

  useEffect(() => {
    setUsage(getClientUsage(toolKey));
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.toolKey === toolKey || e.detail.toolKey === "all") {
        setUsage(getClientUsage(toolKey));
      }
    };
    window.addEventListener("otk_quota_updated", handleUpdate);
    return () => window.removeEventListener("otk_quota_updated", handleUpdate);
  }, [toolKey]);

  const access = evaluateFeatureAccess(toolKey, isPro, usage);

  const increment = useCallback(() => {
    return incrementClientUsage(toolKey);
  }, [toolKey]);

  return { ...access, isPro, usage, increment };
}

