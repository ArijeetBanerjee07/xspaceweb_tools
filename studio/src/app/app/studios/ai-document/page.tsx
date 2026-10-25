"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import {
  LuSparkles,
  LuMessageSquare,
  LuFileText,
  LuLayers,
  LuSearch,
  LuReceipt,
  LuLanguages,
  LuPencil,
  LuGitCompare,
  LuDownload,
  LuUpload,
  LuCopy,
  LuCheck,
  LuCircleCheck,
  LuCircleAlert,
  LuX,
  LuRefreshCw,
  LuArrowRight,
  LuTrash2,
  LuFileSpreadsheet,
  LuSend,
  LuUsers,
  LuBuilding2,
  LuCalendar,
  LuDollarSign,
  LuMapPin,
  LuTable,
  LuSlidersHorizontal,
  LuFilter,
  LuCrown,
} from "react-icons/lu";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import { useProStatus } from "@/lib/gating";

export interface AiDocTool {
  id: string;
  name: string;
  functionDesc: string;
  primaryUsers: string;
  tier: "Trial credits" | "Paid" | "Sample free; paid" | "Limited free" | "Paid for batch";
  priority: string;
  monetization: string;
  icon: any;
  color: string;
  category: "qa" | "extract" | "transform";
}

const AI_DOC_TOOLS: AiDocTool[] = [
  {
    id: "chat-pdf",
    name: "Chat with PDF",
    functionDesc: "Ask grounded questions with page references",
    primaryUsers: "Students, SMEs",
    tier: "Trial credits",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuMessageSquare,
    color: "from-blue-600 to-indigo-600",
    category: "qa",
  },
  {
    id: "summarize-pdf",
    name: "Summarize PDF",
    functionDesc: "Create short or detailed summaries",
    primaryUsers: "All users",
    tier: "Trial credits",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuFileText,
    color: "from-purple-600 to-indigo-700",
    category: "qa",
  },
  {
    id: "doc-qa",
    name: "Document Q&A",
    functionDesc: "Question answering across uploaded docs",
    primaryUsers: "Teams",
    tier: "Paid",
    priority: "Phase 2",
    monetization: "Credits/seats",
    icon: LuLayers,
    color: "from-indigo-600 to-blue-700",
    category: "qa",
  },
  {
    id: "extract-entities",
    name: "Extract text/tables/entities",
    functionDesc: "Extract names, dates, amounts and tables",
    primaryUsers: "Operations",
    tier: "Sample free; paid",
    priority: "Phase 2",
    monetization: "Extraction credits",
    icon: LuSearch,
    color: "from-emerald-600 to-teal-700",
    category: "extract",
  },
  {
    id: "invoice-extract",
    name: "Invoice/receipt extraction",
    functionDesc: "Return structured invoice fields",
    primaryUsers: "Finance teams",
    tier: "Sample free; paid",
    priority: "Phase 2",
    monetization: "Per-page credits",
    icon: LuReceipt,
    color: "from-rose-500 to-pink-600",
    category: "extract",
  },
  {
    id: "doc-translate",
    name: "Document translation",
    functionDesc: "Translate user-provided documents",
    primaryUsers: "SMEs, students",
    tier: "Limited free",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuLanguages,
    color: "from-amber-500 to-orange-600",
    category: "transform",
  },
  {
    id: "rewrite-simplify",
    name: "Rewrite/simplify document",
    functionDesc: "Adjust tone, reading level and clarity",
    primaryUsers: "Office users",
    tier: "Limited free",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuPencil,
    color: "from-teal-600 to-cyan-600",
    category: "transform",
  },
  {
    id: "compare-docs",
    name: "Compare two documents",
    functionDesc: "Summarize differences and changed clauses",
    primaryUsers: "Legal/operations",
    tier: "Limited free",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuGitCompare,
    color: "from-violet-600 to-purple-800",
    category: "qa",
  },
  {
    id: "export-data",
    name: "Export extracted data",
    functionDesc: "Download CSV/XLSX/JSON-like structured output",
    primaryUsers: "Operations",
    tier: "Paid for batch",
    priority: "Phase 2",
    monetization: "Export quota",
    icon: LuDownload,
    color: "from-blue-600 to-cyan-600",
    category: "extract",
  },
];

function FormattedMessage({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let currentList: ReactNode[] = [];
  let currentTableLines: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-indigo-500">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInline = (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    const tokenRegex = /(\*\*[^*]+?\*\*|\[Page\s*\d+(?:-\d+)?\]|`[^`]+?`|\*[^*]+?\*)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let k = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={k++} className="font-bold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("[Page") && token.endsWith("]")) {
        parts.push(
          <span
            key={k++}
            className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200/90 shadow-2xs align-baseline"
          >
            {token.slice(1, -1)}
          </span>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={k++} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={k++} className="italic text-slate-700">
            {token.slice(1, -1)}
          </em>
        );
      } else {
        parts.push(token);
      }
      lastIdx = tokenRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }
    return parts;
  };

  const flushTable = () => {
    if (currentTableLines.length > 0) {
      const parseCells = (line: string) => {
        return line
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
      };

      const headerLine = currentTableLines[0];
      const headers = parseCells(headerLine);
      const isDelimiter = (line: string) => /^\|?[\s-:|]+\|?$/.test(line.trim()) && line.includes("-");

      const dataRows = currentTableLines
        .slice(1)
        .filter((l) => !isDelimiter(l))
        .map((l) => parseCells(l));

      if (headers.length > 0) {
        blocks.push(
          <div
            key={`table-${blocks.length}`}
            className="my-3 overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs bg-white"
          >
            <table className="min-w-full text-xs text-left divide-y divide-slate-200">
              <thead className="bg-slate-100/80 text-slate-900 font-bold">
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3.5 py-2.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dataRows.map((r, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/80 transition odd:bg-white even:bg-slate-50/40">
                    {r.map((cell, ci) => (
                      <td key={ci} className="px-3.5 py-2 text-slate-700 font-medium">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      currentTableLines = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushTable();
      return;
    }

    // Page divider lines like "--- पेज 1 ---" or "--- Page 1 ---" or "---"
    if (/^---+.*---+$/.test(trimmed) || trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList();
      flushTable();
      const pageLabel = trimmed.replace(/^-+|-+$/g, "").trim();
      blocks.push(
        <div key={i} className="my-3.5 flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" />
          {pageLabel && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] tracking-wider shadow-2xs">
              {pageLabel}
            </span>
          )}
          <div className="h-px bg-slate-200 flex-1" />
        </div>
      );
      return;
    }

    // Check if line is a table row (starts with | or contains multiple |)
    const isTableLine =
      (trimmed.startsWith("|") && trimmed.includes("|")) ||
      (trimmed.includes("|") && trimmed.split("|").length >= 3);
    if (isTableLine) {
      flushList();
      currentTableLines.push(trimmed);
      return;
    } else {
      flushTable();
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push(
        <h4 key={i} className="font-bold text-slate-900 text-xs mt-3 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={i} className="font-bold text-slate-900 text-sm mt-3 mb-1">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push(
        <h2 key={i} className="font-extrabold text-slate-900 text-base mt-4 mb-1.5">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      currentList.push(
        <li key={i} className="text-slate-800 leading-relaxed text-xs">
          {renderInline(trimmed.replace(/^[*•-]\s+/, ""))}
        </li>
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      flushList();
      const numMatch = trimmed.match(/^\d+\./)?.[0] || "";
      blocks.push(
        <div key={i} className="flex items-start gap-1.5 my-1 text-slate-800 leading-relaxed text-xs">
          <span className="font-bold text-indigo-600 shrink-0">{numMatch}</span>
          <div>{renderInline(trimmed.replace(/^\d+\.\s+/, ""))}</div>
        </div>
      );
    } else {
      flushList();
      // Standalone bold line acts as a title or header
      if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("**")) {
        blocks.push(
          <div key={i} className="font-bold text-slate-900 text-sm mt-3 mb-1">
            {trimmed.slice(2, -2)}
          </div>
        );
      } else {
        blocks.push(
          <p key={i} className="my-1 text-slate-800 leading-relaxed text-xs">
            {renderInline(trimmed)}
          </p>
        );
      }
    }
  });

  flushList();
  flushTable();
  return <div className="space-y-1">{blocks}</div>;
}

const PRO_AI_TOOLS = new Set(["chat-pdf", "extract-entities", "rewrite-simplify", "doc-translate"]);

export default function AIDocumentStudioPage() {
  const isPro = useProStatus();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState("AI Document Studio Pro");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTool, setActiveTool] = useState<AiDocTool | null>(null);

  // Shared Document Text & Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>("Sample_Agreement.txt");
  const [uploadedPageCount, setUploadedPageCount] = useState<number>(2);
  const [docContent, setDocContent] = useState<string>(
    `--- PAGE 1 ---
MASTER SERVICE & LICENSING AGREEMENT
This Agreement is entered into on October 22, 2026, by and between:
1. Vendor: Apex Cloud Solutions Pvt Ltd, located in Bengaluru, Karnataka (GSTIN: 29ABCDE1234F1Z5)
2. Client: Starlight Enterprise Corp, located in Mumbai, Maharashtra.

RECITALS & SCOPE
Vendor agrees to deliver enterprise AI document processing infrastructure with a 99.95% availability SLA.
Total contractual value: $150,000 payable in quarterly tranches of $37,500.

--- PAGE 2 ---
OBLIGATIONS & ACTION ITEMS
- Phase 1 Architecture Setup: Deadline November 15, 2026. Owner: Lead Architect Rajiv Sen.
- Data Security Audit & ISO 27001 Certification: Deadline December 10, 2026. Owner: CISO Elena Rostova.
- Client Sign-off and Production Cutover: Deadline December 31, 2026.

TERMINATION & PENALTIES
Either party may terminate upon 30 days written notice. Late payments incur a 1.5% monthly interest penalty.`
  );

  // Comparison Tool Secondary Document
  const [compareDoc2Name, setCompareDoc2Name] = useState<string>("Revised_Agreement_v2.txt");
  const [compareDoc2PageCount, setCompareDoc2PageCount] = useState<number>(2);
  const [compareDoc2Content, setCompareDoc2Content] = useState<string>(
    `--- PAGE 1 ---
MASTER SERVICE & LICENSING AGREEMENT (REVISED)
Entered into on October 25, 2026.
Vendor: Apex Cloud Solutions Pvt Ltd. Client: Starlight Enterprise Corp.
Contractual value updated to $185,000 payable in monthly installments of $15,416.

--- PAGE 2 ---
OBLIGATIONS & ACTION ITEMS
- Phase 1 Setup deadline shortened to November 5, 2026. Owner: Rajiv Sen.
- Mandatory 24/7 incident response hotline added with 15-minute response SLA.
- Termination notice period extended from 30 days to 60 days.`
  );

  // Tool Specific States
  const [chatQuestion, setChatQuestion] = useState("What are the key deadlines and who owns them?");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Document Assistant. Ask any question about your document and I will extract precise answers with page citations.",
    },
  ]);

  const [summaryStyle, setSummaryStyle] = useState<"short" | "detailed" | "bullet">("detailed");
  const [targetLanguage, setTargetLanguage] = useState("Hindi");
  const [rewriteTone, setRewriteTone] = useState("Executive & Polished");
  const [rewriteReadingLevel, setRewriteReadingLevel] = useState("Standard Business");
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv" | "json">("xlsx");
  const [extractionScope, setExtractionScope] = useState<"all" | "parties" | "financial" | "dates" | "tables">("all");
  const [extractionFocus, setExtractionFocus] = useState<string>("");
  const [activeEntityTab, setActiveEntityTab] = useState<"all" | "people" | "orgs" | "dates" | "amounts" | "locations" | "tables" | "summary">("all");
  const [entitySearchQuery, setEntitySearchQuery] = useState<string>("");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyIndividualItem = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const [translationViewMode, setTranslationViewMode] = useState<"formatted" | "plain">("formatted");

  const stripMarkdownForCleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/^---+.*---+$/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/^\|?\s*[-:]+[-| :]*\|\s*$/gm, "")
      .replace(/^\|\s*/gm, "")
      .replace(/\s*\|\s*$/gm, "")
      .replace(/\s*\|\s*/g, "   |   ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // Output States
  const [loading, setLoading] = useState<boolean>(false);
  const [outputResult, setOutputResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTool?.id === "chat-pdf") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, loading, activeTool]);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "parse-only");

      const res = await fetch("/api/ai-document", { method: "POST", body: formData });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to parse file text.");
      }
      const data = await res.json();
      setUploadedFileName(data.fileName);
      setDocContent(data.text);
      setUploadedPageCount(data.pageCount || 1);
      setErrorMessage(null);
      setSuccessMessage(`Document ready: ${data.fileName} (${data.pageCount || 1} pages)`);
    } catch (err: any) {
      setSuccessMessage(null);
      setErrorMessage(err?.message || "File upload failed.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleDoc2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "parse-only");

      const res = await fetch("/api/ai-document", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to parse secondary file.");
      const data = await res.json();
      setCompareDoc2Name(data.fileName);
      setCompareDoc2Content(data.text);
      setCompareDoc2PageCount(data.pageCount || 1);
      setErrorMessage(null);
      setSuccessMessage(`Secondary document ready: ${data.fileName} (${data.pageCount || 1} pages)`);
    } catch (err: any) {
      setSuccessMessage(null);
      setErrorMessage(err?.message || "Failed to load secondary file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleAskSuggestion = async (promptText: string) => {
    if (loading || !promptText.trim()) return;
    setChatQuestion("");
    setLoading(true);
    setErrorMessage(null);
    setChatHistory((prev) => [...prev, { role: "user", content: promptText }]);
    try {
      const res = await fetch("/api/ai-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          docContent,
          question: promptText,
          history: chatHistory,
        }),
      });
      if (!res.ok) throw new Error("Chat request failed.");
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err: any) {
      setErrorMessage(err?.message || "Chat request failed.");
    } finally {
      setLoading(false);
    }
  };

  // Run Tool Action
  const handleExecuteTool = async (toolId: string) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (toolId === "chat-pdf") {
        if (!chatQuestion.trim()) throw new Error("Please enter a question.");
        const currentQ = chatQuestion;
        setChatHistory((prev) => [...prev, { role: "user", content: currentQ }]);
        setChatQuestion("");

        const res = await fetch("/api/ai-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "chat",
            docContent,
            question: currentQ,
            history: chatHistory,
          }),
        });
        if (!res.ok) throw new Error("Chat request failed.");
        const data = await res.json();
        setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
        setLoading(false);
        return;
      }

      if (toolId === "export-data") {
        const payloadData =
          outputResult?.entities || outputResult?.lineItems || outputResult || { content: docContent };
        const res = await fetch("/api/ai-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "export",
            data: payloadData,
            format: exportFormat,
          }),
        });
        if (!res.ok) throw new Error("Export failed.");
        await downloadBlobResponse(res, `exported_data.${exportFormat}`);
        setSuccessMessage(`Exported successfully as .${exportFormat}`);
        setLoading(false);
        return;
      }

      let payload: any = {};
      if (toolId === "summarize-pdf") {
        payload = { action: "summarize", docContent, style: summaryStyle };
      } else if (toolId === "doc-qa") {
        payload = {
          action: "qa",
          docs: [{ name: uploadedFileName, content: docContent }],
          question: chatQuestion || "Summarize the primary responsibilities and liability limits.",
        };
      } else if (toolId === "extract-entities") {
        payload = {
          action: "extract-entities",
          docContent,
          focus: extractionFocus,
          targetCategory: extractionScope,
        };
      } else if (toolId === "invoice-extract") {
        payload = { action: "extract-invoice", docContent };
      } else if (toolId === "doc-translate") {
        payload = { action: "translate", docContent, targetLanguage };
      } else if (toolId === "rewrite-simplify") {
        payload = {
          action: "rewrite",
          docContent,
          tone: rewriteTone,
          readingLevel: rewriteReadingLevel,
        };
      } else if (toolId === "compare-docs") {
        payload = {
          action: "compare",
          doc1: { name: uploadedFileName, content: docContent },
          doc2: { name: compareDoc2Name, content: compareDoc2Content },
        };
      }

      const res = await fetch("/api/ai-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "AI processing failed.");
      }

      const data = await res.json();
      setOutputResult(data);
      setSuccessMessage("AI analysis completed successfully!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Execution error.");
    } finally {
      setLoading(false);
    }
  };

  const downloadBlobResponse = async (res: Response, fallbackName: string) => {
    let resolvedName = fallbackName;
    const headerFilename = res.headers.get("x-filename");
    if (headerFilename) resolvedName = decodeURIComponent(headerFilename);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resolvedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTools = AI_DOC_TOOLS.filter((t) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "qa" && t.category === "qa") ||
      (activeTab === "extract" && t.category === "extract") ||
      (activeTab === "transform" && t.category === "transform");

    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.functionDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.primaryUsers.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-blue-600 transition">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">AI Document Studio</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3 z-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
            <LuSparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Section B &bull; AI Document Studio Blueprint &bull; Groq Fast Inference</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AI Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Studio</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            All 10 verified blueprint AI document capabilities: chat with grounded page citations, summarize PDFs, extract entities &amp; invoice fields, translate documents, compare clauses, and export structured datasets.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium flex items-center gap-1.5">
              <LuMessageSquare className="w-3.5 h-3.5 text-blue-300" /> Grounded Page Citations
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium flex items-center gap-1.5">
              <LuReceipt className="w-3.5 h-3.5 text-emerald-300" /> Invoice &amp; Entity Extraction
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium flex items-center gap-1.5">
              <LuFileSpreadsheet className="w-3.5 h-3.5 text-amber-300" /> CSV / XLSX Export
            </span>
          </div>
        </div>

        {/* 3D AI Document Neural Illustration with quote */}
        <div className="relative z-10 self-center lg:self-auto shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/30 to-purple-500/20 rounded-full blur-2xl group-hover:blur-3xl transition" />
            <img
              src="/banners/ai_document.png"
              alt="3D AI Document Neural Illustration"
              className="relative w-36 sm:w-44 lg:w-48 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            />
          </div>
          <div className="text-center font-serif italic text-indigo-200 font-bold text-xs mt-1">
            &ldquo;Smarter Documents Faster Results.&rdquo;
          </div>
          <div className="text-[10px] text-indigo-300/80">High Precision &bull; Zero Hallucination</div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
          {[
            { id: "all", label: "All Tools (10)" },
            { id: "qa", label: "Chat & Q&A (4)" },
            { id: "extract", label: "Extraction & Export (3)" },
            { id: "transform", label: "Transform & Actions (3)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI tools or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 10 Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const ToolIcon = tool.icon;
          const isToolProOnly = PRO_AI_TOOLS.has(tool.id);
          return (
            <div
              key={tool.id}
              onClick={() => {
                if (isToolProOnly && !isPro) {
                  setHighlightFeature(tool.name);
                  setIsUpgradeOpen(true);
                  return;
                }
                setActiveTool(tool);
                setOutputResult(null);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shadow-xs`}>
                    <ToolIcon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {tool.primaryUsers}
                    </span>
                    {isToolProOnly ? (
                      isPro ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <LuCrown className="w-3 h-3 text-blue-600" />
                          <span>PRO</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <LuCrown className="w-3 h-3 text-amber-600" />
                          <span>PRO ONLY</span>
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        100% Free
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {tool.functionDesc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {tool.monetization}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-1 transition">
                  Launch Tool <LuArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tool Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-hidden">
          {activeTool.id === "chat-pdf" ? (
            /* Dedicated High-Capacity Document Chat Workspace */
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Chat Header */}
              <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeTool.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    <activeTool.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{activeTool.name}</h3>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Page Grounded
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{activeTool.functionDesc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <LuFileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={uploadedFileName}>
                      {uploadedFileName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 text-[11px] font-medium">{uploadedPageCount} pgs</span>
                  </div>

                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition">
                    <LuUpload className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Change File</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {chatHistory.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setChatHistory([
                          {
                            role: "assistant",
                            content:
                              "Hello! I am your AI Document Assistant. Ask any question about your document and I will extract precise answers with page citations.",
                          },
                        ])
                      }
                      className="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
                      title="Reset chat conversation"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTool(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Message Feed */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                    <LuCircleAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mr-3 mt-1 shadow-xs">
                        <LuSparkles className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "max-w-[85%] sm:max-w-[75%] bg-indigo-600 text-white rounded-tr-xs shadow-xs"
                          : "max-w-[95%] sm:max-w-[88%] bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className={`font-bold text-[11px] ${
                            msg.role === "user" ? "text-indigo-200" : "text-indigo-600"
                          }`}
                        >
                          {msg.role === "user" ? "You" : "AI Document Assistant"}
                        </span>
                        {msg.role === "assistant" && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.content)}
                            className="text-slate-400 hover:text-slate-700 text-[11px] font-medium flex items-center gap-1 transition"
                            title="Copy response"
                          >
                            {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                      </div>

                      {msg.role === "user" ? (
                        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                      ) : (
                        <div className="text-slate-800">
                          <FormattedMessage content={msg.content} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <LuSparkles className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                      <LuRefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Reviewing document and cross-referencing citations...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Pinned Bottom Input & Suggestions */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200/90 shrink-0 space-y-2.5">
                {/* Quick Suggestion Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <span className="text-slate-400 font-semibold shrink-0 mr-1">Suggestions:</span>
                  {[
                    "What are the key features of this project?",
                    "Summarize the main problem and solution",
                    "List all critical deliverables and deadlines",
                    "Who are the key stakeholders or target users?",
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => handleAskSuggestion(chip)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium shrink-0 transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading && chatQuestion.trim()) {
                        handleExecuteTool("chat-pdf");
                      }
                    }}
                    placeholder="Ask any question about this document... (Press Enter to send)"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    disabled={loading || !chatQuestion.trim()}
                    onClick={() => handleExecuteTool("chat-pdf")}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold flex items-center gap-2 transition disabled:opacity-50 text-xs sm:text-sm shadow-xs shrink-0 cursor-pointer"
                  >
                    {loading ? (
                      <LuRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LuSend className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 w-full ${activeTool.id === "extract-entities" ? "max-w-4xl" : "max-w-3xl"} max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeTool.color} text-white flex items-center justify-center`}>
                    <activeTool.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activeTool.name}</h3>
                    <p className="text-[11px] text-slate-500">{activeTool.functionDesc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTool(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <LuCircleAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {!errorMessage && successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                    <LuCircleCheck className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Sleek Active Document Card (Hidden in compare-docs mode) */}
                {activeTool.id !== "compare-docs" && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-xs flex items-center justify-center shrink-0">
                        <LuFileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[220px] sm:max-w-md" title={uploadedFileName}>
                            {uploadedFileName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase shrink-0">
                            {uploadedFileName.split('.').pop() || 'PDF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                          <span>Ready for analysis</span>
                          <span className="text-slate-300">•</span>
                          <span>{uploadedPageCount} page{uploadedPageCount > 1 ? "s" : ""} indexed</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs">
                        <LuUpload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

              {/* 2. Summarize PDF */}
              {activeTool.id === "summarize-pdf" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Summary Format:</span>
                    {(["short", "detailed", "bullet"] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setSummaryStyle(style)}
                        className={`px-3 py-1.5 rounded-xl capitalize font-semibold border transition ${
                          summaryStyle === style
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {style} Summary
                      </button>
                    ))}
                  </div>

                  {outputResult?.summary && (
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900">Generated Summary</span>
                        <button
                          onClick={() => copyToClipboard(outputResult.summary)}
                          className="px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-purple-800 font-semibold flex items-center gap-1 hover:bg-purple-100/50"
                        >
                          {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <div className="text-slate-800 leading-relaxed">
                        <FormattedMessage content={outputResult.summary} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Document Q&A */}
              {activeTool.id === "doc-qa" && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Inquiry Across Document</label>
                    <input
                      type="text"
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      placeholder="e.g. Compare obligations or find payment terms..."
                    />
                  </div>
                  {outputResult?.answer && (
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                      <div className="font-bold text-indigo-900">Cross-Document Findings</div>
                      <div className="text-slate-800 leading-relaxed">
                        <FormattedMessage content={outputResult.answer} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Extract Text/Tables/Entities */}
              {activeTool.id === "extract-entities" && (
                <div className="space-y-4">
                  {/* Scope & Control Configuration */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-slate-50 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-slate-800 text-xs">Extraction Scope & Configuration</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {extractionScope === "all" ? "Comprehensive Scan" : "Targeted Scope"}
                      </span>
                    </div>

                    {/* Scope Selector Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
                      {[
                        { id: "all", label: "All Items", icon: LuSparkles, desc: "Everything" },
                        { id: "parties", label: "Signatories", icon: LuUsers, desc: "Parties & Reps" },
                        { id: "financial", label: "Financials", icon: LuDollarSign, desc: "Values & Fees" },
                        { id: "dates", label: "Key Dates", icon: LuCalendar, desc: "Deadlines" },
                        { id: "tables", label: "Tables", icon: LuTable, desc: "Schedules" },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = extractionScope === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setExtractionScope(item.id as any)}
                            className={`p-2 rounded-xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-[11px]">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </div>
                            <span className={`text-[9px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Focus Input & Presets */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <label className="font-semibold text-slate-700 flex items-center gap-1">
                          <LuSlidersHorizontal className="w-3 h-3 text-emerald-600" />
                          <span>Custom Focus / Keyword Guiding (Optional):</span>
                        </label>
                        {extractionFocus && (
                          <button
                            type="button"
                            onClick={() => setExtractionFocus("")}
                            className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                          >
                            Clear focus
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={extractionFocus}
                        onChange={(e) => setExtractionFocus(e.target.value)}
                        placeholder="e.g. non-solicitation, liability caps, termination clauses, milestone deadlines..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />

                      {/* Quick Preset Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-[10px] scrollbar-none">
                        <span className="text-slate-400 font-semibold shrink-0">Presets:</span>
                        {[
                          "Signatories & Authorized Reps",
                          "Liability Limits & Penalties",
                          "Effective & Expiration Dates",
                          "Governing Jurisdiction & Venue",
                          "Payment Terms & Tranches",
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setExtractionFocus(preset)}
                            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 shrink-0 transition cursor-pointer font-medium"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pre-Extraction Capabilities Overview (when no results yet) */}
                  {!outputResult?.entities && (
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <LuSparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>High-Precision NLP & OCR Target Capabilities</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900">
                            <LuUsers className="w-4 h-4 text-blue-600" />
                            <span>People & Signatories</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Detects signers, legal counsel, corporate officers, witnesses, and stakeholders.
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-purple-900">
                            <LuBuilding2 className="w-4 h-4 text-purple-600" />
                            <span>Organizations & Parties</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Identifies disclosing/receiving parties, parent entities, subsidiaries, and vendors.
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <LuCalendar className="w-4 h-4 text-amber-600" />
                            <span>Dates & Timelines</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Extracts execution dates, effective windows, renewal periods, and SLA deadlines.
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <LuDollarSign className="w-4 h-4 text-emerald-600" />
                            <span>Financials & Amounts</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Captures contract valuations, tranches, interest penalties, and currencies.
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-900">
                            <LuMapPin className="w-4 h-4 text-rose-600" />
                            <span>Locations & Venues</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Maps registered offices, governing jurisdictions, arbitration courts, and states.
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-teal-900">
                            <LuTable className="w-4 h-4 text-teal-600" />
                            <span>Structured Tables</span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            Reconstructs row-column matrices, fee schedules, exhibits, and CSV-exportable grids.
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <LuSparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Ready to parse <strong>{uploadedFileName}</strong> ({uploadedPageCount} pgs)</span>
                        </div>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleExecuteTool("extract-entities")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {loading ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                          <span>{loading ? "Extracting..." : "Run AI Extraction"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Results Display (when outputResult is present) */}
                  {outputResult?.entities && (
                    <div className="space-y-4 pt-1">
                      {/* KPI & Controls Header */}
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">Extracted Results:</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            {(outputResult.entities.people?.length || 0) +
                              (outputResult.entities.organizations?.length || 0) +
                              (outputResult.entities.dates?.length || 0) +
                              (outputResult.entities.amounts?.length || 0) +
                              (outputResult.entities.locations?.length || 0)}{" "}
                            Entities
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                            {outputResult.tables?.length || 0} Tables
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                            <LuCheck className="w-3 h-3" /> Grounded
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(outputResult, null, 2));
                              setCopiedItem("all-json");
                              setTimeout(() => setCopiedItem(null), 2000);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            {copiedItem === "all-json" ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                            <span>{copiedItem === "all-json" ? "JSON Copied" : "Copy JSON"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExecuteTool("extract-entities")}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <LuRefreshCw className="w-3.5 h-3.5" />
                            <span>Re-run</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Filter Tabs & Search Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                          {[
                            { id: "all", label: "All Items" },
                            { id: "people", label: `People (${outputResult.entities.people?.length || 0})` },
                            { id: "orgs", label: `Orgs (${outputResult.entities.organizations?.length || 0})` },
                            { id: "dates", label: `Dates (${outputResult.entities.dates?.length || 0})` },
                            { id: "amounts", label: `Amounts (${outputResult.entities.amounts?.length || 0})` },
                            { id: "locations", label: `Locations (${outputResult.entities.locations?.length || 0})` },
                            { id: "tables", label: `Tables (${outputResult.tables?.length || 0})` },
                            { id: "summary", label: "Summary" },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveEntityTab(tab.id as any)}
                              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition whitespace-nowrap cursor-pointer ${
                                activeEntityTab === tab.id
                                  ? "bg-slate-900 text-white shadow-2xs"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="relative w-full sm:w-48 shrink-0">
                          <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter entities..."
                            value={entitySearchQuery}
                            onChange={(e) => setEntitySearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>
                      </div>

                      {/* Entity Grid Sections */}
                      <div className="space-y-3">
                        {/* 1. People / Signatories */}
                        {(activeEntityTab === "all" || activeEntityTab === "people") && (
                          <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
                                <LuUsers className="w-3.5 h-3.5 text-blue-600" />
                                <span>People & Signatories ({outputResult.entities.people?.length || 0})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {outputResult.entities.people?.filter((item: string) => !entitySearchQuery || item.toLowerCase().includes(entitySearchQuery.toLowerCase())).map((p: string, idx: number) => {
                                const idKey = `p-${idx}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => copyIndividualItem(p, idKey)}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-slate-800 text-[11px] font-medium flex items-center gap-1.5 transition shadow-2xs group cursor-pointer"
                                    title="Click to copy"
                                  >
                                    <span>{p}</span>
                                    {copiedItem === idKey ? (
                                      <LuCheck className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <LuCopy className="w-3 h-3 text-slate-300 group-hover:text-blue-600 transition" />
                                    )}
                                  </button>
                                );
                              })}
                              {(!outputResult.entities.people || outputResult.entities.people.length === 0) && (
                                <span className="text-slate-400 text-[11px] italic">No individuals or signatories detected.</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. Organizations */}
                        {(activeEntityTab === "all" || activeEntityTab === "orgs") && (
                          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-purple-950 text-xs">
                                <LuBuilding2 className="w-3.5 h-3.5 text-purple-600" />
                                <span>Organizations & Entities ({outputResult.entities.organizations?.length || 0})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {outputResult.entities.organizations?.filter((item: string) => !entitySearchQuery || item.toLowerCase().includes(entitySearchQuery.toLowerCase())).map((org: string, idx: number) => {
                                const idKey = `org-${idx}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => copyIndividualItem(org, idKey)}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 hover:border-purple-400 text-slate-800 text-[11px] font-medium flex items-center gap-1.5 transition shadow-2xs group cursor-pointer"
                                    title="Click to copy"
                                  >
                                    <span>{org}</span>
                                    {copiedItem === idKey ? (
                                      <LuCheck className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <LuCopy className="w-3 h-3 text-slate-300 group-hover:text-purple-600 transition" />
                                    )}
                                  </button>
                                );
                              })}
                              {(!outputResult.entities.organizations || outputResult.entities.organizations.length === 0) && (
                                <span className="text-slate-400 text-[11px] italic">No organizations detected.</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. Dates & Deadlines */}
                        {(activeEntityTab === "all" || activeEntityTab === "dates") && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                                <LuCalendar className="w-3.5 h-3.5 text-amber-600" />
                                <span>Dates & Milestones ({outputResult.entities.dates?.length || 0})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {outputResult.entities.dates?.filter((item: string) => !entitySearchQuery || item.toLowerCase().includes(entitySearchQuery.toLowerCase())).map((d: string, idx: number) => {
                                const idKey = `d-${idx}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => copyIndividualItem(d, idKey)}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-slate-800 text-[11px] font-medium flex items-center gap-1.5 transition shadow-2xs group cursor-pointer"
                                    title="Click to copy"
                                  >
                                    <span>{d}</span>
                                    {copiedItem === idKey ? (
                                      <LuCheck className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <LuCopy className="w-3 h-3 text-slate-300 group-hover:text-amber-600 transition" />
                                    )}
                                  </button>
                                );
                              })}
                              {(!outputResult.entities.dates || outputResult.entities.dates.length === 0) && (
                                <span className="text-slate-400 text-[11px] italic">No dates detected.</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 4. Financials & Amounts */}
                        {(activeEntityTab === "all" || activeEntityTab === "amounts") && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                                <LuDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Financial Amounts & Currency ({outputResult.entities.amounts?.length || 0})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {outputResult.entities.amounts?.filter((item: string) => !entitySearchQuery || item.toLowerCase().includes(entitySearchQuery.toLowerCase())).map((amt: string, idx: number) => {
                                const idKey = `amt-${idx}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => copyIndividualItem(amt, idKey)}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 text-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition shadow-2xs group cursor-pointer"
                                    title="Click to copy"
                                  >
                                    <span>{amt}</span>
                                    {copiedItem === idKey ? (
                                      <LuCheck className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <LuCopy className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition" />
                                    )}
                                  </button>
                                );
                              })}
                              {(!outputResult.entities.amounts || outputResult.entities.amounts.length === 0) && (
                                <span className="text-slate-400 text-[11px] italic">No financial amounts detected.</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 5. Locations & Venues */}
                        {(activeEntityTab === "all" || activeEntityTab === "locations") && (
                          <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                                <LuMapPin className="w-3.5 h-3.5 text-rose-600" />
                                <span>Locations, Venues & Jurisdictions ({outputResult.entities.locations?.length || 0})</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {outputResult.entities.locations?.filter((item: string) => !entitySearchQuery || item.toLowerCase().includes(entitySearchQuery.toLowerCase())).map((loc: string, idx: number) => {
                                const idKey = `loc-${idx}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => copyIndividualItem(loc, idKey)}
                                    className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 hover:border-rose-400 text-slate-800 text-[11px] font-medium flex items-center gap-1.5 transition shadow-2xs group cursor-pointer"
                                    title="Click to copy"
                                  >
                                    <span>{loc}</span>
                                    {copiedItem === idKey ? (
                                      <LuCheck className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <LuCopy className="w-3 h-3 text-slate-300 group-hover:text-rose-600 transition" />
                                    )}
                                  </button>
                                );
                              })}
                              {(!outputResult.entities.locations || outputResult.entities.locations.length === 0) && (
                                <span className="text-slate-400 text-[11px] italic">No locations or jurisdictions detected.</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 6. Extracted Tables */}
                        {(activeEntityTab === "all" || activeEntityTab === "tables") && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                                <LuTable className="w-4 h-4 text-teal-600" />
                                <span>Structured Tables & Line Items ({outputResult.tables?.length || 0})</span>
                              </div>
                            </div>

                            {outputResult.tables && outputResult.tables.length > 0 ? (
                              <div className="space-y-3">
                                {outputResult.tables.map((tbl: any, tblIdx: number) => (
                                  <div key={tblIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                                    <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-[11px]">
                                      <span className="font-bold text-slate-700">Table {tblIdx + 1} ({tbl.rows?.length || 0} rows)</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const csv = [
                                            tbl.headers.join(","),
                                            ...tbl.rows.map((r: any) => r.join(","))
                                          ].join("\n");
                                          copyIndividualItem(csv, `tbl-${tblIdx}`);
                                        }}
                                        className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedItem === `tbl-${tblIdx}` ? (
                                          <span className="text-emerald-600 flex items-center gap-1"><LuCheck className="w-3 h-3" /> CSV Copied</span>
                                        ) : (
                                          <span className="flex items-center gap-1"><LuCopy className="w-3 h-3" /> Copy as CSV</span>
                                        )}
                                      </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-[11px]">
                                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                                          <tr>
                                            {tbl.headers?.map((h: string, hIdx: number) => (
                                              <th key={hIdx} className="px-3 py-2 whitespace-nowrap">{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {tbl.rows?.map((row: string[], rIdx: number) => (
                                            <tr key={rIdx} className="hover:bg-slate-50/60">
                                              {row.map((cell: string, cIdx: number) => (
                                                <td key={cIdx} className="px-3 py-2 text-slate-700">{cell}</td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 text-[11px] text-center">
                                No multi-column tabular arrays detected in the document text. All structured parameters are categorized in the entity buckets above.
                              </div>
                            )}
                          </div>
                        )}

                        {/* 7. Executive Summary / Raw Analysis */}
                        {(activeEntityTab === "all" || activeEntityTab === "summary") && outputResult.rawAnalysis && (
                          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                                <LuSparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Executive Synthesis & Entity Overview</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyIndividualItem(outputResult.rawAnalysis, "summary-raw")}
                                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                {copiedItem === "summary-raw" ? <LuCheck className="w-3 h-3 text-emerald-600" /> : <LuCopy className="w-3 h-3" />}
                                <span>{copiedItem === "summary-raw" ? "Copied" : "Copy"}</span>
                              </button>
                            </div>
                            <div className="text-slate-800 text-[11px] leading-relaxed whitespace-pre-wrap">
                              {outputResult.rawAnalysis}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Invoice/Receipt Extraction */}
              {activeTool.id === "invoice-extract" && (
                <div className="space-y-3">
                  {outputResult?.invoiceNumber && (
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                        <div>
                          <div className="font-bold text-rose-950 text-sm">Invoice #: {outputResult.invoiceNumber}</div>
                          <div className="text-slate-500 text-[11px]">Vendor: {outputResult.vendor?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-rose-700 text-sm">{outputResult.currency} {outputResult.grandTotal}</div>
                          <div className="text-slate-500 text-[11px]">Date: {outputResult.invoiceDate}</div>
                        </div>
                      </div>

                      {outputResult.lineItems && outputResult.lineItems.length > 0 && (
                        <table className="w-full text-[11px] bg-white border border-rose-200 rounded-xl overflow-hidden">
                          <thead className="bg-rose-100/50 text-rose-900">
                            <tr>
                              <th className="p-2 text-left">Description</th>
                              <th className="p-2 text-right">Qty</th>
                              <th className="p-2 text-right">Price</th>
                              <th className="p-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {outputResult.lineItems.map((it: any, i: number) => (
                              <tr key={i} className="border-t border-rose-100">
                                <td className="p-2 font-medium">{it.description}</td>
                                <td className="p-2 text-right">{it.quantity}</td>
                                <td className="p-2 text-right">{it.unitPrice}</td>
                                <td className="p-2 text-right font-semibold">{it.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Document Translation */}
              {activeTool.id === "doc-translate" && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs">Target Language</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        { val: "Hindi", label: "Hindi (हिन्दी)" },
                        { val: "Spanish", label: "Spanish (Español)" },
                        { val: "French", label: "French (Français)" },
                        { val: "German", label: "German (Deutsch)" },
                        { val: "Tamil", label: "Tamil (தமிழ்)" },
                        { val: "Telugu", label: "Telugu (తెలుగు)" },
                        { val: "Arabic", label: "Arabic (العربية)" },
                        { val: "Japanese", label: "Japanese (日本語)" },
                      ].map((lang) => (
                        <button
                          key={lang.val}
                          type="button"
                          onClick={() => setTargetLanguage(lang.val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                            targetLanguage === lang.val
                              ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs"
                    >
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="French">French (Français)</option>
                      <option value="German">German (Deutsch)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Japanese">Japanese (日本語)</option>
                      <option value="Simplified Chinese">Simplified Chinese (简体中文)</option>
                      <option value="Russian">Russian (Русский)</option>
                      <option value="Portuguese">Portuguese (Português)</option>
                      <option value="Italian">Italian (Italiano)</option>
                    </select>
                  </div>

                  {outputResult?.translatedText && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border border-amber-200 space-y-3">
                      {/* Controls & View Mode Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                            <LuLanguages className="w-4 h-4 text-amber-600" />
                            <span>Translated Document ({targetLanguage})</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <LuCheck className="w-3 h-3" /> Fully Formatted
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* View Mode Toggle */}
                          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 text-[11px] font-semibold">
                            <button
                              type="button"
                              onClick={() => setTranslationViewMode("formatted")}
                              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                translationViewMode === "formatted"
                                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Formatted
                            </button>
                            <button
                              type="button"
                              onClick={() => setTranslationViewMode("plain")}
                              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                translationViewMode === "plain"
                                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Clean Text
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const textToCopy =
                                translationViewMode === "plain"
                                  ? stripMarkdownForCleanText(outputResult.translatedText)
                                  : outputResult.translatedText;
                              copyToClipboard(textToCopy);
                            }}
                            className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-800 font-semibold text-[11px] flex items-center gap-1 hover:bg-amber-50 transition cursor-pointer"
                          >
                            {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Reader Body */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs">
                        {translationViewMode === "formatted" ? (
                          <div className="leading-relaxed">
                            <FormattedMessage content={outputResult.translatedText} />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed select-all">
                            {stripMarkdownForCleanText(outputResult.translatedText)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 7. Rewrite/Simplify Document */}
              {activeTool.id === "rewrite-simplify" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Target Tone</label>
                      <select
                        value={rewriteTone}
                        onChange={(e) => setRewriteTone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="Executive & Polished">Executive &amp; Polished</option>
                        <option value="Concise & Plain Language">Concise &amp; Plain Language</option>
                        <option value="Formal Legal">Formal Legal</option>
                        <option value="Friendly & Professional">Friendly &amp; Professional</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Reading Level</label>
                      <select
                        value={rewriteReadingLevel}
                        onChange={(e) => setRewriteReadingLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="Standard Business">Standard Business</option>
                        <option value="Simple / Elementary">Simple / Non-technical</option>
                        <option value="Advanced / Scholarly">Advanced / Rigorous</option>
                      </select>
                    </div>
                  </div>

                  {outputResult?.rewrittenText && (
                    <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-900">Rewritten Document</span>
                        <button
                          onClick={() => copyToClipboard(outputResult.rewrittenText)}
                          className="px-2.5 py-1 bg-white border border-teal-300 rounded-lg text-teal-800 font-semibold flex items-center gap-1"
                        >
                          {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <div className="text-slate-800 leading-relaxed">
                        <FormattedMessage content={outputResult.rewrittenText} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 8. Compare Two Documents */}
              {activeTool.id === "compare-docs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
                    {/* Document A (Base / Original) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/50 via-white to-blue-50/20 border border-blue-200/90 shadow-2xs flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                            A
                          </span>
                          <span className="font-bold text-slate-800 text-xs">Base Document</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                          {uploadedFileName.split('.').pop() || 'PDF'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <LuFileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate" title={uploadedFileName}>
                            {uploadedFileName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span>{uploadedPageCount} page{uploadedPageCount > 1 ? "s" : ""} loaded</span>
                          </p>
                        </div>
                      </div>

                      <label className="cursor-pointer w-full py-2 bg-white hover:bg-blue-50/60 border border-blue-200/80 rounded-xl text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs">
                        <LuUpload className="w-3.5 h-3.5" />
                        <span>Upload Document A</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Document B (Revised / Comparison) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-50/50 via-white to-purple-50/20 border border-purple-200/90 shadow-2xs flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                            B
                          </span>
                          <span className="font-bold text-slate-800 text-xs">Revised Version</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                          {compareDoc2Name.split('.').pop() || 'PDF'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <LuGitCompare className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate" title={compareDoc2Name}>
                            {compareDoc2Name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            <span>{compareDoc2PageCount} page{compareDoc2PageCount > 1 ? "s" : ""} loaded</span>
                          </p>
                        </div>
                      </div>

                      <label className="cursor-pointer w-full py-2 bg-white hover:bg-purple-50/60 border border-purple-200/80 rounded-xl text-purple-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs">
                        <LuUpload className="w-3.5 h-3.5" />
                        <span>Upload Document B</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleDoc2Upload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {outputResult?.comparison && (
                    <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-violet-900">Audit of Differences &amp; Changed Clauses</span>
                        <button
                          onClick={() => copyToClipboard(outputResult.comparison)}
                          className="px-2.5 py-1 bg-white border border-violet-300 rounded-lg text-violet-800 font-semibold flex items-center gap-1"
                        >
                          {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <div className="text-slate-800 leading-relaxed">
                        <FormattedMessage content={outputResult.comparison} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 9. Export Extracted Data */}
              {activeTool.id === "export-data" && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Export Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "xlsx", label: "Excel (.xlsx)", desc: "Formatted workbook with colored headers" },
                        { id: "csv", label: "CSV (.csv)", desc: "Universal spreadsheet data" },
                        { id: "json", label: "JSON (.json)", desc: "Structured hierarchical payload" },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setExportFormat(fmt.id as any)}
                          className={`p-3 rounded-xl border text-left transition ${
                            exportFormat === fmt.id
                              ? "border-blue-500 bg-blue-50/50 text-blue-900 font-bold"
                              : "border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div>{fmt.label}</div>
                          <div className="text-[10px] text-slate-500 mt-1 font-normal">{fmt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-500">
                Monetization: <strong className="text-slate-700">{activeTool.monetization}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Close
                </button>
                {activeTool.id !== "chat-pdf" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleExecuteTool(activeTool.id)}
                    className={`px-5 py-2 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer ${
                      activeTool.id === "extract-entities"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {loading ? (
                      <>
                        <LuRefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {activeTool.id === "export-data" ? (
                          <LuDownload className="w-4 h-4" />
                        ) : (
                          <LuSparkles className="w-4 h-4" />
                        )}
                        <span>
                          {activeTool.id === "export-data"
                            ? "Download Export"
                            : activeTool.id === "extract-entities"
                            ? outputResult?.entities
                              ? "Re-extract Data"
                              : "Extract Entities & Tables"
                            : "Analyze with AI"}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Upgrade Checkout Modal */}
      <UpgradeCheckoutModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        highlightFeature={highlightFeature}
      />
    </div>
  );
}
