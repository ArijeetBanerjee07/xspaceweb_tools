// Utility for tracking and synchronizing live workspace tool operations across studios and dashboard

export interface SystemOperation {
  id: string;
  toolId: string;
  toolName: string;
  studioName: string;
  studioCategory: "pdf" | "background" | "ai-doc" | "security" | "qr" | "office";
  durationSec: number;
  sizeBytes: number;
  createdAt: string; // ISO string
  href: string;
}

const STORAGE_KEY = "xspaceweb_operations_log";

export function resolveToolMeta(toolId: string): {
  toolName: string;
  studioName: string;
  studioCategory: "pdf" | "background" | "ai-doc" | "security" | "qr" | "office";
  href: string;
} {
  const id = (toolId || "").toLowerCase();

  if (id.includes("bg") || id.includes("background") || id.includes("matting") || id.includes("passport")) {
    return {
      toolName: id.includes("passport") ? "Passport Photo Auto-Crop" : "AI Background Matting",
      studioName: "Background Studio",
      studioCategory: "background",
      href: "/app/studios/background",
    };
  }
  if (id.includes("ai") || id.includes("chat") || id.includes("summariz") || id.includes("contract")) {
    return {
      toolName: id.includes("chat")
        ? "AI Document Chat"
        : id.includes("contract")
        ? "AI Contract Risk Scanner"
        : "AI Document Summarizer",
      studioName: "AI Document Studio",
      studioCategory: "ai-doc",
      href: "/app/studios/ai-document",
    };
  }
  if (id.includes("compress")) {
    return {
      toolName: "Compress PDF",
      studioName: "PDF Studio",
      studioCategory: "pdf",
      href: "/app/studios/pdf",
    };
  }
  if (id.includes("excel") || id.includes("sheet")) {
    return {
      toolName: "Excel to PDF Table Formatter",
      studioName: "Office Studio",
      studioCategory: "office",
      href: "/app/studios/office",
    };
  }
  if (id.includes("qr")) {
    return {
      toolName: "Dynamic QR Code Generator",
      studioName: "QR & Link Studio",
      studioCategory: "qr",
      href: "/app/studios/qr",
    };
  }
  if (id.includes("sign") || id.includes("protect") || id.includes("security")) {
    return {
      toolName: "Digital E-Signature Stamp",
      studioName: "Security Studio",
      studioCategory: "security",
      href: "/app/studios/security",
    };
  }

  return {
    toolName: id.includes("word")
      ? "PDF to Word"
      : toolId
      ? toolId.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "PDF Conversion",
    studioName: "PDF Studio",
    studioCategory: "pdf",
    href: "/app/studios/pdf",
  };
}

export function recordOperation(op: Partial<SystemOperation>): SystemOperation {
  const meta = resolveToolMeta(op.toolId || op.toolName || "pdf-to-word");
  const newOp: SystemOperation = {
    id: op.id || `job-${Math.floor(10000 + Math.random() * 90000)}`,
    toolId: op.toolId || "pdf-to-word",
    toolName: op.toolName || meta.toolName,
    studioName: op.studioName || meta.studioName,
    studioCategory: op.studioCategory || meta.studioCategory,
    durationSec: op.durationSec ?? Number((0.35 + Math.random() * 0.5).toFixed(2)),
    sizeBytes: op.sizeBytes ?? Math.floor(1024 * 1024 * (1 + Math.random() * 4)),
    createdAt: op.createdAt || new Date().toISOString(),
    href: op.href || meta.href,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: SystemOperation[] = raw ? JSON.parse(raw) : [];
      list.unshift(newOp);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 300)));
      window.dispatchEvent(new CustomEvent("xspaceweb:activity-logged", { detail: newOp }));
    } catch {}
  }

  return newOp;
}

export function getLocalOperations(): SystemOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: SystemOperation[] = JSON.parse(raw);
    // Filter out legacy dummy/simulated baseline jobs
    return list.filter((op) => !op.id.startsWith("job-89") && !op.id.startsWith("dummy-"));
  } catch {
    return [];
  }
}

