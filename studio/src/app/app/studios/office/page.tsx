"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LuSparkles,
  LuFileText,
  LuFileSpreadsheet,
  LuCalculator,
  LuReceipt,
  LuScrollText,
  LuMail,
  LuRefreshCw,
  LuDownload,
  LuCopy,
  LuCheck,
  LuX,
  LuPlus,
  LuTrash2,
  LuUpload,
  LuArrowRight,
  LuCircleCheck,
  LuCircleAlert,
  LuSearch,
  LuInfo,
  LuCrown,
} from "react-icons/lu";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import { useProStatus, checkClientFeatureAccess, incrementClientUsage } from "@/lib/gating";

export interface OfficeTool {
  id: string;
  name: string;
  functionDesc: string;
  primaryUsers: string;
  tier: "Free limited" | "Limited free" | "Paid" | "Free template; paid batch";
  priority: string;
  monetization: string;
  icon: any;
  color: string;
  category: "docs" | "sheets";
}

const OFFICE_TOOLS: OfficeTool[] = [
  {
    id: "ai-doc",
    name: "AI-assisted document creation",
    functionDesc: "Draft business documents from prompts/briefs",
    primaryUsers: "SMEs",
    tier: "Limited free",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuSparkles,
    color: "from-blue-600 to-indigo-600",
    category: "docs",
  },
  {
    id: "docx-gen",
    name: "DOCX generation",
    functionDesc: "Create editable Word files",
    primaryUsers: "Office users",
    tier: "Free limited",
    priority: "Phase 2",
    monetization: "Export tier",
    icon: LuFileText,
    color: "from-blue-500 to-blue-700",
    category: "docs",
  },
  {
    id: "xlsx-gen",
    name: "Excel/XLSX creation",
    functionDesc: "Create structured workbooks",
    primaryUsers: "SMEs",
    tier: "Paid",
    priority: "Phase 2",
    monetization: "Export tier",
    icon: LuFileSpreadsheet,
    color: "from-emerald-500 to-teal-700",
    category: "sheets",
  },
  {
    id: "formula-suggester",
    name: "Spreadsheet formulas",
    functionDesc: "Suggest and explain formulas",
    primaryUsers: "Office users",
    tier: "Limited free",
    priority: "Phase 2",
    monetization: "AI credits",
    icon: LuCalculator,
    color: "from-amber-500 to-orange-600",
    category: "sheets",
  },
  {
    id: "invoice-templates",
    name: "Invoice templates",
    functionDesc: "Generate business invoice templates",
    primaryUsers: "SMEs",
    tier: "Free template; paid batch",
    priority: "Phase 2",
    monetization: "Templates",
    icon: LuReceipt,
    color: "from-rose-500 to-pink-600",
    category: "docs",
  },
  {
    id: "report-gen",
    name: "Report generation",
    functionDesc: "Turn inputs/data into reports",
    primaryUsers: "Teams",
    tier: "Paid",
    priority: "Phase 2",
    monetization: "Credits",
    icon: LuScrollText,
    color: "from-teal-500 to-cyan-700",
    category: "docs",
  },
  {
    id: "business-letters",
    name: "Business letter generation",
    functionDesc: "Create formal letters and notices",
    primaryUsers: "SMEs",
    tier: "Limited free",
    priority: "Phase 2",
    monetization: "Credits",
    icon: LuMail,
    color: "from-sky-500 to-blue-700",
    category: "docs",
  },
];

export default function OfficeStudioPage() {
  const isPro = useProStatus();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState("Office Studio");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTool, setActiveTool] = useState<OfficeTool | null>(null);

  // Loading States
  const [loading, setLoading] = useState<boolean>(false);
  const [drafting, setDrafting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 1. AI Doc State
  const [aiDocTitle, setAiDocTitle] = useState("Strategic Partnership Agreement");
  const [aiDocBrief, setAiDocBrief] = useState("Formalize a technology collaboration and co-marketing agreement between two SaaS firms.");
  const [aiDocType, setAiDocType] = useState<"proposal" | "agreement" | "memo" | "sop" | "policy">("agreement");
  const [aiDocTone, setAiDocTone] = useState<"professional" | "formal" | "concise" | "persuasive">("professional");
  const [aiDocSections, setAiDocSections] = useState<{ heading: string; body: string }[]>([
    { heading: "1. Purpose & Parties", body: "This Agreement sets forth the mutual covenants and deliverables governing the collaborative relationship." },
    { heading: "2. Scope of Engagement & Deliverables", body: "The performing party shall execute designated technical deliverables according to agreed benchmarks." },
    { heading: "3. Terms & Confidentiality", body: "Both parties maintain mutual obligations of confidentiality, non-disclosure, and prompt dispute resolution." },
  ]);
  const [aiDocMode, setAiDocMode] = useState<"full" | "sections">("full");
  const [aiDocFullText, setAiDocFullText] = useState<string>(
    `1. Purpose & Parties\nThis Agreement sets forth the mutual covenants and deliverables governing the collaborative relationship between the parties.\n\n2. Scope of Engagement & Deliverables\nThe performing party shall execute designated technical deliverables according to agreed benchmarks and quality standards.\n\n3. Terms & Confidentiality\nBoth parties maintain mutual obligations of confidentiality, non-disclosure, and prompt dispute resolution under applicable jurisdiction.`
  );

  // 2. DOCX Gen State
  const [docxTitle, setDocxTitle] = useState("Weekly Project Status Brief");
  const [docxAuthor, setDocxAuthor] = useState("Operations Lead");
  const [docxPrompt, setDocxPrompt] = useState("Summarize delivery milestones, risk assessment, and upcoming release dates.");
  const [docxContent, setDocxContent] = useState(
    "1. Executive Overview\nMilestone deliverables across all functional streams are progressing on schedule.\n\n2. Key Achievements\nCompleted end-to-end integration of automated pipelines and telemetry.\n\n3. Next Steps\nConduct stakeholder readiness review prior to general availability."
  );

  // 3. XLSX Gen State
  const [xlsxTitle, setXlsxTitle] = useState("Monthly Revenue & Order Tracker");
  const [xlsxPrompt, setXlsxPrompt] = useState("Create a sales order tracker with Order ID, Customer, Region, Status, and Total Amount ($).");
  const [xlsxColumns, setXlsxColumns] = useState<any[]>([
    { header: "Order ID", key: "id", width: 16 },
    { header: "Customer Name", key: "customer", width: 24 },
    { header: "Region", key: "region", width: 16 },
    { header: "Status", key: "status", width: 16 },
    { header: "Total Amount ($)", key: "amount", width: 18 },
  ]);
  const [xlsxRows, setXlsxRows] = useState<any[]>([
    { id: "ORD-101", customer: "Apex Tech Labs", region: "North", status: "Delivered", amount: 4500 },
    { id: "ORD-102", customer: "Zion Global Systems", region: "West", status: "In Transit", amount: 2800 },
    { id: "ORD-103", customer: "Starlight Enterprise", region: "South", status: "Delivered", amount: 6200 },
    { id: "ORD-104", customer: "Horizon Retail", region: "East", status: "Pending", amount: 1950 },
  ]);

  // 4. Formula Suggester State
  const [formulaPrompt, setFormulaPrompt] = useState("Calculate sum of sales in North region where status is Paid");
  const [formulaResult, setFormulaResult] = useState<any>(null);

  // 5. Invoice State
  const [invoiceNum, setInvoiceNum] = useState("INV-2026-089");
  const [invoiceSender, setInvoiceSender] = useState("Acme Technologies Pvt Ltd, Bangalore");
  const [invoiceClient, setInvoiceClient] = useState("Nexus Global Systems, Mumbai");
  const [invoiceItems, setInvoiceItems] = useState([
    { description: "Enterprise Software License", quantity: 1, unitPrice: 45000 },
    { description: "Implementation & Setup Support", quantity: 10, unitPrice: 2500 },
  ]);

  // 7. Report State
  const [reportTitle, setReportTitle] = useState("Q3 Operational Productivity & Compliance Report");
  const [reportType, setReportType] = useState("Operational Audit");
  const [reportContext, setReportContext] = useState("Turnaround velocity improved by 42% following automated document processing rollout.");
  const [reportSummary, setReportSummary] = useState("Overall system throughput improved by 42% following automated document processing rollout.");
  const [includeReportMetrics, setIncludeReportMetrics] = useState<boolean>(true);
  const [reportMetrics, setReportMetrics] = useState<{ metric: string; value: string; trend: string }[]>([
    { metric: "Document Velocity", value: "+42%", trend: "Upward" },
    { metric: "Error Rates", value: "0.12%", trend: "Reduced" },
    { metric: "SLA Adherence", value: "99.8%", trend: "Optimal" },
  ]);
  const [reportFindings, setReportFindings] = useState<string[]>([
    "Standardized template pipelines accelerated document preparation by 3.5x.",
    "Centralized validation prevented 100% of formatting discrepancy rejections.",
  ]);
  const [reportRecommendations, setReportRecommendations] = useState<string[]>([
    "Deploy batch document workflows across all operational hubs.",
    "Maintain recurring performance benchmarking for quarterly audits.",
  ]);

  // 8. Business Letter State
  const [letterType, setLetterType] = useState("Offer Letter");
  const [letterSubject, setLetterSubject] = useState("Formal Offer of Employment: Senior Product Architect");
  const [letterSenderName, setLetterSenderName] = useState("Priya Sharma");
  const [letterSenderTitle, setLetterSenderTitle] = useState("Director of Talent");
  const [letterSenderCompany, setLetterSenderCompany] = useState("Starlight Enterprise Corp");
  const [letterRecipientName, setLetterRecipientName] = useState("Rahul Mehta");
  const [letterRecipientCompany, setLetterRecipientCompany] = useState("Applicant");
  const [letterRecipientAddress, setLetterRecipientAddress] = useState("Bengaluru, Karnataka");
  const [letterDetails, setLetterDetails] = useState("Compensation: ₹28,00,000 CTC. Start date: November 15, 2026.");
  const [letterParagraphs, setLetterParagraphs] = useState<string[]>([
    "We are delighted to extend this formal offer of employment for the position of Senior Product Architect at Starlight Enterprise Corp.",
    "Your starting compensation will be ₹28,00,000 CTC with comprehensive medical coverage and performance equity grants.",
    "Please countersign and return this letter by November 5, 2026 to confirm your acceptance.",
  ]);

  // Filter tools
  const filteredTools = OFFICE_TOOLS.filter((tool) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "docs" && tool.category === "docs") ||
      (activeTab === "sheets" && tool.category === "sheets");

    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.functionDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.primaryUsers.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.monetization.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Toggle between Structured Sections and Continuous Full Document
  const handleToggleDocMode = (newMode: "full" | "sections") => {
    if (newMode === aiDocMode) return;
    if (newMode === "full") {
      // Compile sections into continuous full document
      const compiled = aiDocSections.map((s) => `${s.heading}\n\n${s.body}`).join("\n\n\n");
      setAiDocFullText(compiled);
    } else {
      // Parse full text into sections
      const paragraphs = aiDocFullText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const parsedSections: { heading: string; body: string }[] = [];
      let currentHeading = "1. Document Overview";
      let currentBodyLines: string[] = [];

      paragraphs.forEach((p) => {
        if (/^(\d+\.|\#{1,3}\s|\*{2}.+\*{2}$)/.test(p) && p.length < 80) {
          if (currentBodyLines.length > 0) {
            parsedSections.push({ heading: currentHeading, body: currentBodyLines.join("\n\n") });
            currentBodyLines = [];
          }
          currentHeading = p.replace(/^(\#{1,3}\s|\*{2})/g, "").replace(/\*{2}$/g, "").trim();
        } else {
          currentBodyLines.push(p);
        }
      });
      if (currentBodyLines.length > 0 || parsedSections.length === 0) {
        parsedSections.push({
          heading: currentHeading,
          body: currentBodyLines.join("\n\n") || "Document content...",
        });
      }
      setAiDocSections(parsedSections);
    }
    setAiDocMode(newMode);
  };

  // Dynamic AI Drafting Call (calls Groq to generate preview content)
  const handleDraftWithAi = async (toolId: string) => {
    const toolKey = `office:${toolId}`;
    const access = checkClientFeatureAccess(toolKey, isPro);
    if (!access.allowed) {
      setHighlightFeature(OFFICE_TOOLS.find((t) => t.id === toolId)?.name || "Office Studio");
      setIsUpgradeOpen(true);
      return;
    }

    setDrafting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (toolId === "ai-doc") {
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "draft-ai-document",
            title: aiDocTitle,
            brief: aiDocBrief,
            docType: aiDocType,
            tone: aiDocTone,
            mode: aiDocMode,
          }),
        });
        if (!res.ok) throw new Error("AI drafting failed.");
        const data = await res.json();
        if (data.fullText) {
          setAiDocFullText(data.fullText);
        }
        if (data.sections && Array.isArray(data.sections)) {
          setAiDocSections(data.sections);
          if (!data.fullText) {
            setAiDocFullText(data.sections.map((s: any) => `${s.heading}\n\n${s.body}`).join("\n\n\n"));
          }
        }
        setSuccessMessage("AI drafted document successfully! You can review or edit the text below before downloading.");
      } else if (toolId === "docx-gen") {
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "draft-docx",
            title: docxTitle,
            prompt: docxPrompt,
            author: docxAuthor,
          }),
        });
        if (!res.ok) throw new Error("AI drafting failed.");
        const data = await res.json();
        if (data.sections && Array.isArray(data.sections)) {
          const formatted = data.sections.map((s: any) => `${s.heading}\n${s.body}`).join("\n\n");
          setDocxContent(formatted);
          setSuccessMessage("AI drafted document sections! Edit any paragraph below.");
        }
      } else if (toolId === "xlsx-gen") {
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "draft-xlsx",
            title: xlsxTitle,
            prompt: xlsxPrompt,
          }),
        });
        if (!res.ok) throw new Error("AI table drafting failed.");
        const data = await res.json();
        if (data.columns && data.rows) {
          setXlsxColumns(data.columns);
          setXlsxRows(data.rows);
          setSuccessMessage(`AI generated ${data.columns.length} columns and ${data.rows.length} rows! You can click any cell to edit.`);
        }
      } else if (toolId === "formula-suggester") {
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "formula", prompt: formulaPrompt }),
        });
        if (!res.ok) throw new Error("Failed to suggest formula.");
        const data = await res.json();
        setFormulaResult(data);
        setSuccessMessage("Formula generated dynamically!");
      } else if (toolId === "report-gen") {
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "draft-report",
            title: reportTitle,
            reportType,
            context: reportContext,
          }),
        });
        if (!res.ok) throw new Error("AI report drafting failed.");
        const data = await res.json();
        if (data.summary) setReportSummary(data.summary);
        if (data.keyMetrics) {
          setReportMetrics(data.keyMetrics);
          if (data.keyMetrics.length > 0) setIncludeReportMetrics(true);
        }
        if (data.findings) setReportFindings(data.findings);
        if (data.recommendations) setReportRecommendations(data.recommendations);
        setSuccessMessage("AI drafted report sections! You can edit the text and KPI metrics below.");
      } else if (toolId === "business-letters") {
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "draft-letter",
            letterType,
            subject: letterSubject,
            sender: { name: letterSenderName, title: letterSenderTitle, company: letterSenderCompany, address: "HQ Street" },
            recipient: { name: letterRecipientName, title: "Applicant", company: letterRecipientCompany, address: letterRecipientAddress },
            details: letterDetails,
          }),
        });
        if (!res.ok) throw new Error("AI letter composing failed.");
        const data = await res.json();
        if (data.paragraphs && Array.isArray(data.paragraphs)) {
          setLetterParagraphs(data.paragraphs);
          setSuccessMessage("AI composed formal letter! Review or edit paragraphs below.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "AI drafting error.");
    } finally {
      setDrafting(false);
    }
  };

  // Execute Tool Action (Compiles the user-edited preview content into binary file download)
  const handleExecuteTool = async (toolId: string) => {
    const toolKey = `office:${toolId}`;
    const access = checkClientFeatureAccess(toolKey, isPro);
    if (!access.allowed) {
      setHighlightFeature(OFFICE_TOOLS.find((t) => t.id === toolId)?.name || "Office Studio");
      setIsUpgradeOpen(true);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (toolId === "formula-suggester") {
        // Download sample sheet with the formula
        const payload = {
          action: "xlsx",
          title: "Formula_Calculation_Sheet",
          sheetName: "Calculations",
          columns: (formulaResult?.exampleData?.columns || ["Col A", "Col B"]).map((c: string) => ({ header: c, key: c })),
          rows: (formulaResult?.exampleData?.rows || [["100", "200"]]).map((r: any[]) => {
            const rowObj: any = {};
            (formulaResult?.exampleData?.columns || ["Col A", "Col B"]).forEach((col: string, i: number) => {
              rowObj[col] = r[i];
            });
            return rowObj;
          }),
        };
        const res = await fetch("/api/office", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to download formula sheet.");
        await downloadBlobResponse(res, "spreadsheet_formula_sample.xlsx");
        setSuccessMessage("Formula sample workbook downloaded!");
        setLoading(false);
        return;
      }

      let payload: any = { action: "" };

      if (toolId === "ai-doc") {
        payload = {
          action: "ai-document",
          title: aiDocTitle,
          brief: aiDocBrief,
          docType: aiDocType,
          tone: aiDocTone,
          mode: aiDocMode,
          sections: aiDocSections,
          fullText: aiDocFullText,
        };
      } else if (toolId === "docx-gen") {
        payload = {
          action: "docx",
          title: docxTitle,
          author: docxAuthor,
          content: docxContent, // Uses user-edited content
        };
      } else if (toolId === "xlsx-gen") {
        payload = {
          action: "xlsx",
          title: xlsxTitle,
          columns: xlsxColumns,
          rows: xlsxRows, // Uses user-edited rows
        };
      } else if (toolId === "invoice-templates") {
        payload = {
          action: "invoice",
          invoiceNumber: invoiceNum,
          from: { name: invoiceSender, address: "HQ Street", email: "billing@company.com" },
          billTo: { name: invoiceClient, address: "Client Address", email: "accounts@client.com" },
          items: invoiceItems,
          currency: "INR",
          taxRatePercent: 18,
        };
      } else if (toolId === "report-gen") {
        payload = {
          action: "report",
          title: reportTitle,
          reportType: reportType,
          author: "Executive Operations",
          summary: reportSummary, // Uses user-edited summary
          keyMetrics: includeReportMetrics ? reportMetrics : [], // Excluded if user toggled off
          findings: reportFindings, // Uses user-edited findings
          recommendations: reportRecommendations, // Uses user-edited recommendations
        };
      } else if (toolId === "business-letters") {
        payload = {
          action: "business-letter",
          letterType: letterType,
          subject: letterSubject,
          sender: { name: letterSenderName, title: letterSenderTitle, company: letterSenderCompany, address: "Tech Hub, BLR" },
          recipient: { name: letterRecipientName, title: "Applicant", company: letterRecipientCompany, address: letterRecipientAddress },
          paragraphs: letterParagraphs, // Uses user-edited paragraphs
        };
      }

      const res = await fetch("/api/office", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Generation failed with status ${res.status}`);
      }

      await downloadBlobResponse(res);
      incrementClientUsage(toolKey);
      setSuccessMessage("Document generated and downloaded successfully with your customized text!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "An error occurred while running the tool.");
    } finally {
      setLoading(false);
    }
  };

  const downloadBlobResponse = async (res: Response, defaultName = "office_document") => {
    let resolvedName = defaultName;
    const headerFilename = res.headers.get("x-filename");
    if (headerFilename) {
      resolvedName = decodeURIComponent(headerFilename);
    } else {
      const disposition = res.headers.get("content-disposition");
      if (disposition && disposition.includes("filename=")) {
        const m = disposition.match(/filename="?([^";]+)"?/);
        if (m && m[1]) resolvedName = decodeURIComponent(m[1]);
      }
    }

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

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/app" className="hover:text-blue-600 transition">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-slate-800 font-semibold">Office Studio</span>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3 z-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
            <LuSparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Section J &bull; Office Studio &bull; Dynamic AI &amp; Editable Previews</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Office <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Studio</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            All 7 verified office tools: dynamic AI drafting, editable in-app previews, custom spreadsheet generators, invoice creation, and formal reporting.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium flex items-center gap-1.5">
              <LuFileText className="w-3.5 h-3.5 text-blue-300" /> 7 Office Tools
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium flex items-center gap-1.5">
              <LuSparkles className="w-3.5 h-3.5 text-amber-300" /> Dynamic AI Drafting
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium flex items-center gap-1.5">
              <LuReceipt className="w-3.5 h-3.5 text-emerald-300" /> Invoicing &amp; Reports
            </span>
          </div>
        </div>

        {/* 3D Office Workstation Illustration */}
        <div className="relative z-10 self-center lg:self-auto shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600/30 to-teal-500/20 rounded-full blur-2xl group-hover:blur-3xl transition" />
            <img
              src="/banners/office_desk.png"
              alt="3D Office Desk Workstation"
              className="relative w-44 sm:w-52 lg:w-60 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
          {[
            { id: "all", label: "All Tools (7)" },
            { id: "docs", label: "Documents & Letters (5)" },
            { id: "sheets", label: "Spreadsheets (2)" },
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
            placeholder="Search tools or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid of the 10 Blueprint Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const ToolIcon = tool.icon;
          const access = checkClientFeatureAccess(`office:${tool.id}`, isPro);
          return (
            <div
              key={tool.id}
              onClick={() => {
                if (!access.allowed) {
                  setHighlightFeature(tool.name);
                  setIsUpgradeOpen(true);
                  return;
                }
                setActiveTool(tool);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between space-y-4"
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
                    {isPro ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <LuCrown className="w-3 h-3 text-blue-600" />
                        <span>PRO</span>
                      </span>
                    ) : access.allowed ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {access.remaining} / 3 free
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <LuCrown className="w-3 h-3 text-amber-600" />
                        <span>Pro Only</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
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
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-1 transition">
                  Open Tool <LuArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tool Modal with Dynamic AI Drafting & Live Editable Previews */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
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

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <LuCircleAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <LuCircleCheck className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1. AI Doc Creation */}
              {activeTool.id === "ai-doc" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <LuSparkles className="w-4 h-4 text-blue-600" /> AI Document Prompt &amp; Context
                      </span>
                      <button
                        type="button"
                        disabled={drafting}
                        onClick={() => handleDraftWithAi("ai-doc")}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {drafting ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                        <span>{drafting ? "Generating..." : "Generate Draft with AI"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Document Title</label>
                        <input
                          type="text"
                          value={aiDocTitle}
                          onChange={(e) => setAiDocTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Type</label>
                          <select
                            value={aiDocType}
                            onChange={(e) => setAiDocType(e.target.value as any)}
                            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl"
                          >
                            <option value="agreement">Agreement</option>
                            <option value="proposal">Proposal</option>
                            <option value="memo">Memo</option>
                            <option value="sop">SOP</option>
                            <option value="policy">Policy</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Tone</label>
                          <select
                            value={aiDocTone}
                            onChange={(e) => setAiDocTone(e.target.value as any)}
                            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl"
                          >
                            <option value="professional">Professional</option>
                            <option value="formal">Formal</option>
                            <option value="concise">Concise</option>
                            <option value="persuasive">Persuasive</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Brief / Special Instructions</label>
                      <textarea
                        rows={2}
                        value={aiDocBrief}
                        onChange={(e) => setAiDocBrief(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Live Editable Document Preview with Mode Toggle */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <span>
                            {aiDocMode === "full"
                              ? "Editable Document (Continuous Draft)"
                              : `Structured Sections (${aiDocSections.length} Sections)`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {aiDocMode === "full"
                            ? "Complete single document editor — ideal for continuous drafting without card boundaries."
                            : "Clause-by-clause structured editor — add, rename, or reorder discrete document sections."}
                        </p>
                      </div>

                      {/* Mode Toggle & Action */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => handleToggleDocMode("full")}
                            className={`px-3 py-1 rounded-lg transition ${
                              aiDocMode === "full"
                                ? "bg-white text-blue-600 shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Continuous Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleDocMode("sections")}
                            className={`px-3 py-1 rounded-lg transition ${
                              aiDocMode === "sections"
                                ? "bg-white text-blue-600 shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Structured Sections
                          </button>
                        </div>

                        {aiDocMode === "sections" && (
                          <button
                            type="button"
                            onClick={() =>
                              setAiDocSections([
                                ...aiDocSections,
                                {
                                  heading: `${aiDocSections.length + 1}. New Custom Section`,
                                  body: "Enter section terms and clauses here...",
                                },
                              ])
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 transition"
                          >
                            <LuPlus className="w-3.5 h-3.5" />
                            <span>Add Section</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode 1: Continuous Full Document (Very Big Text Field) */}
                    {aiDocMode === "full" && (
                      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition space-y-0">
                        <textarea
                          rows={13}
                          value={aiDocFullText}
                          onChange={(e) => setAiDocFullText(e.target.value)}
                          placeholder="Type or generate the complete document text here..."
                          className="w-full p-4 text-xs font-sans text-slate-800 leading-relaxed focus:outline-none resize-y min-h-[290px] border-0"
                        />
                        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            {aiDocFullText.trim() ? aiDocFullText.trim().split(/\s+/).length : 0} words &bull; {aiDocFullText.length} characters
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(aiDocFullText);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition"
                          >
                            {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied" : "Copy Text"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Section-by-Section Cards */}
                    {aiDocMode === "sections" && (
                      <div className="space-y-3">
                        {aiDocSections.map((sec, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs">
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={sec.heading}
                                onChange={(e) => {
                                  const updated = [...aiDocSections];
                                  updated[idx].heading = e.target.value;
                                  setAiDocSections(updated);
                                }}
                                className="font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none flex-1 py-0.5 text-xs"
                              />
                              {aiDocSections.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setAiDocSections(aiDocSections.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-500 p-1 transition"
                                  title="Delete Section"
                                >
                                  <LuTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <textarea
                              rows={3}
                              value={sec.body}
                              onChange={(e) => {
                                const updated = [...aiDocSections];
                                updated[idx].body = e.target.value;
                                setAiDocSections(updated);
                              }}
                              className="w-full p-2 border border-slate-200 rounded-xl text-[11px] leading-relaxed text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. DOCX Generation */}
              {activeTool.id === "docx-gen" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Document Outline &amp; Guidance</span>
                      <button
                        type="button"
                        disabled={drafting}
                        onClick={() => handleDraftWithAi("docx-gen")}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {drafting ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                        <span>{drafting ? "Drafting..." : "Draft Content with AI"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Title</label>
                        <input
                          type="text"
                          value={docxTitle}
                          onChange={(e) => setDocxTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Author / Lead</label>
                        <input
                          type="text"
                          value={docxAuthor}
                          onChange={(e) => setDocxAuthor(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Prompt / Topic Requirements</label>
                      <input
                        type="text"
                        value={docxPrompt}
                        onChange={(e) => setDocxPrompt(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        placeholder="e.g. Outline quarterly deliverables and risks..."
                      />
                    </div>
                  </div>

                  {/* Live Editable Textarea Preview */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Live Editable Document Text (will be packaged into .docx)
                    </label>
                    <textarea
                      rows={8}
                      value={docxContent}
                      onChange={(e) => setDocxContent(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-2xl font-mono text-xs leading-relaxed text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 3. Excel/XLSX Creation */}
              {activeTool.id === "xlsx-gen" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <LuFileSpreadsheet className="w-4 h-4 text-emerald-600" /> Spreadsheet Specifications
                      </span>
                      <button
                        type="button"
                        disabled={drafting}
                        onClick={() => handleDraftWithAi("xlsx-gen")}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {drafting ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                        <span>{drafting ? "Generating..." : "Generate Table with AI"}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1 text-xs">Workbook Title</label>
                        <input
                          type="text"
                          value={xlsxTitle}
                          onChange={(e) => setXlsxTitle(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700 text-xs">Data Requirements &amp; Table Specifications</label>
                          <span className="text-[11px] text-slate-400">Specify columns, exact values, or descriptive prompt</span>
                        </div>
                        <textarea
                          rows={3}
                          value={xlsxPrompt}
                          onChange={(e) => setXlsxPrompt(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y leading-relaxed font-normal"
                          placeholder="e.g. Columns: Order ID, Name, Rupees&#10;Row 1: ORD-001, Milk, 100&#10;Row 2: ORD-002, Bread, 400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Editable Spreadsheet Grid Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Editable Spreadsheet Preview ({xlsxRows.length} Rows &bull; Click cell to edit)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newRow: any = {};
                          xlsxColumns.forEach((c) => (newRow[c.key] = "New Data"));
                          setXlsxRows([...xlsxRows, newRow]);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                      >
                        <LuPlus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-900 text-white">
                          <tr>
                            {xlsxColumns.map((c, i) => (
                              <th key={i} className="p-2.5 text-left font-semibold">
                                {c.header}
                              </th>
                            ))}
                            <th className="w-10 p-2.5 text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {xlsxRows.map((r, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50/70">
                              {xlsxColumns.map((col, colIdx) => (
                                <td key={colIdx} className="p-1.5">
                                  <input
                                    type="text"
                                    value={r[col.key] ?? ""}
                                    onChange={(e) => {
                                      const updated = [...xlsxRows];
                                      updated[rowIdx][col.key] = e.target.value;
                                      setXlsxRows(updated);
                                    }}
                                    className="w-full px-2 py-1 border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none text-xs"
                                  />
                                </td>
                              ))}
                              <td className="p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setXlsxRows(xlsxRows.filter((_, i) => i !== rowIdx))}
                                  className="text-slate-400 hover:text-rose-500"
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Spreadsheet Formulas */}
              {activeTool.id === "formula-suggester" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        <LuCalculator className="w-4 h-4 text-amber-600" /> Formula Requirements
                      </span>
                      <button
                        type="button"
                        disabled={drafting}
                        onClick={() => handleDraftWithAi("formula-suggester")}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {drafting ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                        <span>{drafting ? "Calculating..." : "Suggest Formula with AI"}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={formulaPrompt}
                      onChange={(e) => setFormulaPrompt(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      placeholder="e.g. Calculate average revenue where country is India and orders > 50..."
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Sum sales where status is Paid",
                        "Lookup customer phone with XLOOKUP",
                        "Count tasks completed in Q3",
                        "Monthly loan EMI calculation",
                      ].map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => setFormulaPrompt(example)}
                          className="px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-amber-200/60 text-slate-700 rounded-lg text-[11px]"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formulaResult && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">Recommended Formula</span>
                        <button
                          onClick={() => copyToClipboard(formulaResult.formula)}
                          className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-semibold text-amber-800 flex items-center gap-1 hover:bg-amber-100/50"
                        >
                          {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-600" /> : <LuCopy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied!" : "Copy Formula"}</span>
                        </button>
                      </div>

                      <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
                        {formulaResult.formula}
                      </div>

                      <div className="text-slate-700">
                        <span className="font-semibold">Explanation: </span>
                        {formulaResult.description}
                      </div>

                      <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-amber-200">
                        Syntax: {formulaResult.syntax}
                      </div>

                      {formulaResult.exampleData && (
                        <div className="overflow-x-auto pt-1">
                          <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <thead className="bg-slate-100">
                              <tr>
                                {formulaResult.exampleData.columns.map((c: string) => (
                                  <th key={c} className="p-1.5 border-b text-left font-semibold text-slate-700">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {formulaResult.exampleData.rows.map((row: any[], i: number) => (
                                <tr key={i} className="border-b border-slate-100">
                                  {row.map((cell: any, j: number) => (
                                    <td key={j} className="p-1.5 text-slate-600">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Invoice Templates (Preserved as requested) */}
              {activeTool.id === "invoice-templates" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Invoice #</label>
                      <input
                        type="text"
                        value={invoiceNum}
                        onChange={(e) => setInvoiceNum(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Billed From</label>
                      <input
                        type="text"
                        value={invoiceSender}
                        onChange={(e) => setInvoiceSender(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Billed To</label>
                      <input
                        type="text"
                        value={invoiceClient}
                        onChange={(e) => setInvoiceClient(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">Line Items</label>
                      <button
                        type="button"
                        onClick={() =>
                          setInvoiceItems([...invoiceItems, { description: "Additional Service", quantity: 1, unitPrice: 1000 }])
                        }
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        <LuPlus className="w-3.5 h-3.5" /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {invoiceItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...invoiceItems];
                              newItems[idx].description = e.target.value;
                              setInvoiceItems(newItems);
                            }}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl"
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...invoiceItems];
                              newItems[idx].quantity = Number(e.target.value) || 0;
                              setInvoiceItems(newItems);
                            }}
                            className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center"
                            placeholder="Qty"
                          />
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...invoiceItems];
                              newItems[idx].unitPrice = Number(e.target.value) || 0;
                              setInvoiceItems(newItems);
                            }}
                            className="w-24 px-2 py-1.5 border border-slate-200 rounded-xl text-right"
                            placeholder="Price"
                          />
                          {invoiceItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Report Generation */}
              {activeTool.id === "report-gen" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-950 flex items-center gap-1.5">
                        <LuScrollText className="w-4 h-4 text-teal-600" /> Report Topic &amp; Context
                      </span>
                      <button
                        type="button"
                        disabled={drafting}
                        onClick={() => handleDraftWithAi("report-gen")}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {drafting ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                        <span>{drafting ? "Drafting..." : "Draft Full Report with AI"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Report Title</label>
                        <input
                          type="text"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Report Type</label>
                        <input
                          type="text"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Context / Findings Input</label>
                      <input
                        type="text"
                        value={reportContext}
                        onChange={(e) => setReportContext(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Live Editable Report Preview */}
                  <div className="space-y-3">
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">Editable Executive Summary</label>
                      <textarea
                        rows={3}
                        value={reportSummary}
                        onChange={(e) => setReportSummary(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>

                    <div className="border border-slate-200/80 rounded-2xl p-3.5 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <label htmlFor="kpi-metrics-toggle" className="font-semibold text-slate-800 text-sm cursor-pointer select-none">
                            Include KPI Metrics Table
                          </label>
                          <button
                            id="kpi-metrics-toggle"
                            type="button"
                            role="switch"
                            aria-checked={includeReportMetrics}
                            onClick={() => setIncludeReportMetrics(!includeReportMetrics)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-hidden ${
                              includeReportMetrics ? "bg-teal-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                                includeReportMetrics ? "translate-x-4.5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span className="text-xs font-medium text-slate-400">
                            {includeReportMetrics ? "Included" : "Excluded"}
                          </span>
                        </div>
                        {includeReportMetrics && (
                          <button
                            type="button"
                            onClick={() => setReportMetrics([...reportMetrics, { metric: "New KPI", value: "100%", trend: "Stable" }])}
                            className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition"
                          >
                            <LuPlus className="w-3.5 h-3.5" /> Add KPI
                          </button>
                        )}
                      </div>

                      {includeReportMetrics ? (
                        reportMetrics.length === 0 ? (
                          <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                            No KPI rows yet. Click <span className="font-semibold text-teal-700">Add KPI</span> to insert one, or turn off the toggle above to exclude the table.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {reportMetrics.map((m, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={m.metric}
                                  onChange={(e) => {
                                    const updated = [...reportMetrics];
                                    updated[idx].metric = e.target.value;
                                    setReportMetrics(updated);
                                  }}
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                                  placeholder="Metric Name"
                                />
                                <input
                                  type="text"
                                  value={m.value}
                                  onChange={(e) => {
                                    const updated = [...reportMetrics];
                                    updated[idx].value = e.target.value;
                                    setReportMetrics(updated);
                                  }}
                                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-800"
                                  placeholder="Value"
                                />
                                <input
                                  type="text"
                                  value={m.trend}
                                  onChange={(e) => {
                                    const updated = [...reportMetrics];
                                    updated[idx].trend = e.target.value;
                                    setReportMetrics(updated);
                                  }}
                                  className="w-24 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-800"
                                  placeholder="Trend"
                                />
                                <button
                                  type="button"
                                  onClick={() => setReportMetrics(reportMetrics.filter((_, i) => i !== idx))}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                                  title="Remove KPI row"
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="p-2.5 bg-white/70 border border-slate-200/60 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                          <span>KPI metrics table will be omitted from the exported Word document.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIncludeReportMetrics(true);
                              if (reportMetrics.length === 0) {
                                setReportMetrics([{ metric: "Growth Target", value: "+15%", trend: "Upward" }]);
                              }
                            }}
                            className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
                          >
                            Enable table
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Business Letters */}
              {activeTool.id === "business-letters" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5">
                        <LuMail className="w-4 h-4 text-sky-600" /> Letter Specifications
                      </span>
                      <button
                        type="button"
                        disabled={drafting}
                        onClick={() => handleDraftWithAi("business-letters")}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {drafting ? <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LuSparkles className="w-3.5 h-3.5" />}
                        <span>{drafting ? "Composing..." : "Compose Letter with AI"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Letter Type</label>
                        <select
                          value={letterType}
                          onChange={(e) => setLetterType(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        >
                          <option value="Offer Letter">Formal Offer of Employment</option>
                          <option value="Demand Notice">Notice of Demand</option>
                          <option value="Recommendation">Letter of Recommendation</option>
                          <option value="Termination">Notice of Agreement Termination</option>
                          <option value="Inquiry">Formal Business Inquiry</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                        <input
                          type="text"
                          value={letterSubject}
                          onChange={(e) => setLetterSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Sender Name &amp; Title</label>
                        <input
                          type="text"
                          value={`${letterSenderName} (${letterSenderTitle})`}
                          onChange={(e) => setLetterSenderName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Recipient Name</label>
                        <input
                          type="text"
                          value={letterRecipientName}
                          onChange={(e) => setLetterRecipientName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Editable Letter Paragraphs Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Editable Letter Content ({letterParagraphs.length} Paragraphs)
                      </span>
                      <button
                        type="button"
                        onClick={() => setLetterParagraphs([...letterParagraphs, "New formal paragraph..."])}
                        className="text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1"
                      >
                        <LuPlus className="w-3.5 h-3.5" /> Add Paragraph
                      </button>
                    </div>

                    <div className="space-y-2">
                      {letterParagraphs.map((para, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <textarea
                            rows={3}
                            value={para}
                            onChange={(e) => {
                              const updated = [...letterParagraphs];
                              updated[idx] = e.target.value;
                              setLetterParagraphs(updated);
                            }}
                            className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed"
                          />
                          {letterParagraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLetterParagraphs(letterParagraphs.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-500 mt-2"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-500">
                Quota / Tier: <strong className="text-slate-700">{activeTool.monetization}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleExecuteTool(activeTool.id)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LuRefreshCw className="w-4 h-4 animate-spin" />
                      <span>Packaging...</span>
                    </>
                  ) : (
                    <>
                      <LuDownload className="w-4 h-4" />
                      <span>
                        {activeTool.id === "xlsx-gen"
                          ? "Download Excel (.xlsx)"
                          : activeTool.id === "formula-suggester"
                          ? "Download Formula Sheet (.xlsx)"
                          : "Download Word (.docx)"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
