"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LuArrowRight,
  LuBriefcaseBusiness,
  LuChevronDown,
  LuCreditCard,
  LuFileText,
  LuImage,
  LuLifeBuoy,
  LuMail,
  LuMessageCircleQuestion,
  LuQrCode,
  LuRocket,
  LuSearch,
  LuShieldCheck,
  LuSparkles,
  LuWandSparkles,
} from "react-icons/lu";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PLANS } from "@/config/plans";
import { TOOLS_CATALOG } from "@/config/toolsCatalog";
import { matchesHelpSearch } from "@/lib/helpSearch";

const HELP_TOPICS = [
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Learn the basics and set up your account.",
    icon: LuRocket,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    id: "pdf",
    label: "PDF Studio",
    description: "Edit, convert, merge and more.",
    icon: LuFileText,
    tone: "bg-rose-50 text-rose-500",
  },
  {
    id: "image",
    label: "Image & Banner Studio",
    description: "Create, edit and enhance images.",
    icon: LuImage,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    id: "background",
    label: "Background Studio",
    description: "Remove and change image backgrounds.",
    icon: LuWandSparkles,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    id: "ai-document",
    label: "AI Document Studio",
    description: "AI-powered document tools.",
    icon: LuSparkles,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "office",
    label: "Office Studio",
    description: "Create and work with office files.",
    icon: LuBriefcaseBusiness,
    tone: "bg-orange-50 text-orange-500",
  },
  {
    id: "security",
    label: "Security & E-Signature",
    description: "Sign, protect and secure files.",
    icon: LuShieldCheck,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    id: "qr-link",
    label: "QR & Link Studio",
    description: "Create QR codes and smart links.",
    icon: LuQrCode,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    id: "billing",
    label: "Account & Billing",
    description: "Plans, payments and subscriptions.",
    icon: LuCreditCard,
    tone: "bg-blue-50 text-blue-600",
  },
] as const;

type TopicId = (typeof HELP_TOPICS)[number]["id"];
type FaqCategory = "General" | "PDF" | "Image" | "Account" | "Billing";

const FAQS: {
  question: string;
  answer: string;
  category: FaqCategory;
  topic: TopicId;
}[] = [
  {
    question: "What is XSWTOOLS?",
    answer:
      "XSWTOOLS brings online document, image, productivity and other utility tools together. Choose a tool from its studio, provide the requested file or details, run it, and download or save the result.",
    category: "General",
    topic: "getting-started",
  },
  {
    question: "Is XSWTOOLS free to use?",
    answer: `The Free plan is ₹${PLANS.free.priceInrMonthly}/month. It includes ${PLANS.free.maxFileMb} MB maximum uploads, ${PLANS.free.maxPagesPerFile} pages per file, ${PLANS.free.storageGb} GB storage and the quotas listed for Free in the plan comparison below. Some tools or usage levels require a paid plan.`,
    category: "General",
    topic: "getting-started",
  },
  {
    question: "How do I find and use a tool?",
    answer:
      "Browse the Help Topics below or use search to find a tool or task. Open the linked studio, choose the tool, add the requested file or information, follow the on-screen options, then download or save the output. The tool guides on this page include input and output formats.",
    category: "General",
    topic: "getting-started",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "Supported formats depend on the tool. Examples in the tool directory include PDF, DOC/DOCX, XLSX, PPTX, TXT, PNG, JPG/JPEG, WebP, SVG, and ZIP. Check a tool’s Input and Output details before uploading.",
    category: "General",
    topic: "getting-started",
  },
  {
    question: "Do you store my files?",
    answer:
      "Storage and retention depend on the file workflow and your plan. Workspace storage, upload limits, and output-retention windows are listed in the plan comparison. Review the Privacy Policy and Data Safety pages for how data is handled; avoid uploading information you are not authorized to share.",
    category: "General",
    topic: "getting-started",
  },
  {
    question: "Can I use XSWTOOLS for commercial purposes?",
    answer:
      "Permitted use is governed by the Terms of Service. Please review the Terms for your intended use or contact us if you need clarification.",
    category: "General",
    topic: "getting-started",
  },
  {
    question: "How do I compress a PDF?",
    answer:
      "Open PDF Studio, choose Compress PDF, upload a PDF, select a compression strength, run the operation and download the compressed file. The tool guide lists the supported input and output formats.",
    category: "PDF",
    topic: "pdf",
  },
  {
    question: "How do I convert a PDF to Word?",
    answer:
      "Open PDF Studio and choose PDF to Word (DOCX). Upload your PDF, run the conversion and download the DOCX output. The result can vary with the source document’s layout.",
    category: "PDF",
    topic: "pdf",
  },
  {
    question: "How do I remove a background from an image?",
    answer:
      "Open Background Studio, choose the background-removal tool, upload a supported image, process it and download the result. Check the tool guide for accepted image types and available outputs.",
    category: "Image",
    topic: "background",
  },
  {
    question: "How do I use AI Document Studio?",
    answer:
      "Open AI Document Studio, select an available document tool, upload a supported document and submit your prompt or options. AI usage may consume credits according to your plan; check the current quota in your workspace.",
    category: "General",
    topic: "ai-document",
  },
  {
    question: "How do I sign a document online?",
    answer:
      "Open Security & E-Signature Studio, choose the relevant signing tool, add your document and follow the on-screen steps. Check the tool details for required inputs and available outputs.",
    category: "General",
    topic: "security",
  },
  {
    question: "How do I cancel or change my plan?",
    answer:
      "Sign in and open your workspace Settings or Usage & Plans area to review subscription controls. Available plan changes and cancellation options depend on the subscription status shown in your account.",
    category: "Account",
    topic: "billing",
  },
  {
    question: "What plans and Pro features are available?",
    answer:
      "The comparison below lists plan prices, quotas, upload limits, storage, retention, seats and configured features from the current plan settings. Pro includes higher quotas and limits than Free, a priority queue and SVG export. Other paid plans have the features shown on their cards.",
    category: "Account",
    topic: "billing",
  },
  {
    question: "How are payments handled?",
    answer:
      "Paid-plan checkout is handled through Razorpay. The current checkout UI lists UPI, cards and NetBanking. Payment availability can depend on your account, selected plan and checkout configuration.",
    category: "Billing",
    topic: "billing",
  },
  {
    question: "What should I do if a payment fails or I need an invoice?",
    answer:
      "Check the payment status in your workspace before retrying. For unresolved charges, failed checkout or invoice questions, contact support with the account email and relevant transaction details. Do not send card numbers, CVVs, passwords or UPI PINs.",
    category: "Billing",
    topic: "billing",
  },
];

const POPULAR_QUESTIONS = [
  "What is XSWTOOLS?",
  "How do I compress a PDF?",
  "Is XSWTOOLS free to use?",
  "How do I use AI Document Studio?",
  "How do I remove a background from an image?",
  "How do I sign a document online?",
  "How do I convert a PDF to Word?",
  "How do I cancel or change my plan?",
];

const FAQ_CATEGORIES: ("All" | FaqCategory)[] = [
  "All",
  "General",
  "PDF",
  "Image",
  "Account",
  "Billing",
];

const TOPIC_STUDIO_IDS: Record<TopicId, string[]> = {
  "getting-started": [],
  pdf: ["pdf"],
  image: ["background", "compress"],
  background: ["background"],
  "ai-document": ["ai-document"],
  office: ["office"],
  security: ["security"],
  "qr-link": ["qr-link"],
  billing: [],
};

const HELP_PLAN_OPTIONS = [
  {
    id: "free",
    label: "Free",
    price: `₹${PLANS.free.priceInrMonthly?.toLocaleString("en-IN")}/month`,
    plan: PLANS.free,
  },
  {
    id: "pro-monthly",
    label: "Pro Monthly",
    price: `₹${PLANS.pro.priceInrMonthly?.toLocaleString("en-IN")}/month`,
    plan: PLANS.pro,
  },
  {
    id: "pro-yearly",
    label: "Pro Yearly",
    price: `₹${PLANS.pro.priceInrYearly?.toLocaleString("en-IN")}/year`,
    plan: PLANS.pro,
  },
];

export function PublicHelpCenter() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<TopicId | "all">("all");
  const [activeFaqCategory, setActiveFaqCategory] = useState<
    "All" | FaqCategory
  >("All");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredTopics = useMemo(
    () =>
      HELP_TOPICS.filter(
        (topic) =>
          (activeTopic === "all" || topic.id === activeTopic) &&
          matchesHelpSearch(query, topic.label, topic.description),
      ),
    [activeTopic, query],
  );
  const filteredFaqs = useMemo(
    () =>
      FAQS.filter(
        (faq) =>
          (activeTopic === "all" || faq.topic === activeTopic) &&
          (activeFaqCategory === "All" ||
            faq.category === activeFaqCategory) &&
          matchesHelpSearch(query, faq.question, faq.answer, faq.category),
      ),
    [activeFaqCategory, activeTopic, query],
  );
  const filteredTools = useMemo(
    () =>
      TOOLS_CATALOG.filter((tool) => {
        const allowedStudios =
          activeTopic === "all" ? null : TOPIC_STUDIO_IDS[activeTopic];
        return (
          (!allowedStudios || allowedStudios.includes(tool.studioId)) &&
          matchesHelpSearch(
            query,
            tool.name,
            tool.description,
            tool.studioName,
            tool.category,
            tool.tags.join(" "),
            tool.howItWorks,
            tool.inputFormat,
            tool.outputFormat,
            tool.tier,
          )
        );
      }),
    [activeTopic, query],
  );
  const popularFaqs = useMemo(
    () =>
      POPULAR_QUESTIONS.map((question) =>
        FAQS.find((faq) => faq.question === question),
      ).filter(
        (faq): faq is (typeof FAQS)[number] =>
          faq !== undefined &&
          (activeTopic === "all" || faq.topic === activeTopic) &&
          matchesHelpSearch(query, faq.question, faq.answer),
      ),
    [activeTopic, query],
  );
  const filteredPlans = useMemo(
    () =>
      HELP_PLAN_OPTIONS.filter(
        ({ label, price, plan }) =>
          (activeTopic === "all" || activeTopic === "billing") &&
          matchesHelpSearch(
            query,
            label,
            price,
            String(plan.priceInrMonthly),
            String(plan.priceInrYearly),
            `${plan.maxFileMb} MB ${plan.maxPagesPerFile} pages ${plan.storageGb} GB`,
            `${plan.quotas.aiCredits} AI ${plan.quotas.imageCredits} image ${plan.quotas.qrCodes} QR`,
            `${plan.seats} seats ${plan.retentionHours / 24} days`,
            Object.entries(plan.features)
              .filter(([, enabled]) => enabled)
              .map(([feature]) => feature)
              .join(" "),
          ),
      ),
    [activeTopic, query],
  );
  const showPaymentHelp =
    (activeTopic === "all" || activeTopic === "billing") &&
    matchesHelpSearch(
      query,
      "payment payments gateway Razorpay UPI cards NetBanking checkout plan subscriptions failed duplicate charges invoices support",
    );
  const showSupport =
    (activeTopic === "all" || activeTopic === "billing") &&
    matchesHelpSearch(
      query,
      "support help contact support team contact us questions email hello@xswtools.com",
    );

  const choosePopularQuestion = (question: string) => {
    setQuery(question);
    setActiveTopic("all");
    setActiveFaqCategory("All");
    document.getElementById("help-faqs")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#eef7ff] via-[#f5faff] to-[#e8f3ff] px-5 py-9 sm:px-8 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 top-10 h-48 w-48 rounded-full bg-blue-200/50 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">
                HELP CENTER
              </p>
              <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                How can we
                <br />
                <span className="text-[#0861f5]">help you today?</span>
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                Find answers, learn how to use our tools, and get the most out
                of XSWTOOLS.
              </p>

              <form
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  document
                    .getElementById("help-faqs")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-4 flex max-w-[560px] items-center rounded-xl border border-blue-100 bg-white p-1.5 shadow-md shadow-blue-900/5"
              >
                <LuSearch
                  className="ml-2 h-4 w-4 shrink-0 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search help articles, tools, guides, plans, and billing"
                  placeholder="Search for help articles, tools, guides..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#0861f5] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                <span className="font-semibold">Popular searches:</span>
                {["PDF", "Image", "Background Remove", "Compress", "Pricing"].map(
                  (term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-white bg-white/80 px-2.5 py-1 font-medium transition hover:border-blue-200 hover:text-blue-600"
                    >
                      {term}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto hidden h-56 w-full max-w-[430px] items-center justify-center md:flex"
            >
              <div className="absolute h-44 w-64 rounded-[2rem] bg-blue-200/45 blur-2xl" />
              <div className="relative h-40 w-56 rotate-[-4deg] rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-xl shadow-blue-900/10">
                <div className="mb-4 flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-blue-300" />
                  <i className="h-2 w-2 rounded-full bg-blue-200" />
                  <i className="h-2 w-2 rounded-full bg-blue-100" />
                </div>
                <div className="space-y-2.5">
                  <i className="block h-2.5 w-4/5 rounded-full bg-blue-100" />
                  <i className="block h-2.5 w-full rounded-full bg-slate-100" />
                  <i className="block h-2.5 w-5/6 rounded-full bg-slate-100" />
                  <i className="block h-2.5 w-3/5 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="absolute left-[12%] top-[35%] flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-lg">
                <LuFileText className="h-7 w-7" />
              </div>
              <div className="absolute right-[19%] top-[28%] flex h-14 w-14 items-center justify-center rounded-full bg-[#0861f5] text-white shadow-lg shadow-blue-500/30">
                <LuMessageCircleQuestion className="h-8 w-8" />
              </div>
              <div className="absolute bottom-[8%] right-[22%] flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-500 shadow-lg">
                <LuImage className="h-6 w-6" />
              </div>
              <LuArrowRight className="absolute right-[4%] top-[52%] h-8 w-8 rotate-[-25deg] text-blue-400" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1180px] space-y-9 px-5 py-7 sm:px-8 sm:py-9">
          <section aria-labelledby="topics-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  BROWSE BY CATEGORY
                </p>
                <h2
                  id="topics-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  Help Topics
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTopic("all");
                  setActiveFaqCategory("All");
                  setQuery("");
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Categories
                <LuArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopics.map(({ id, label, description, icon: Icon, tone }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveTopic(id);
                    setActiveFaqCategory("All");
                    setQuery("");
                    document
                      .getElementById("help-faqs")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
                    activeTopic === id
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-900">
                      {label}
                    </span>
                    <span className="mt-1 block text-[10px] leading-relaxed text-slate-500">
                      {description}
                    </span>
                  </span>
                  <LuArrowRight className="h-4 w-4 shrink-0 text-blue-500 transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
            {filteredTopics.length === 0 && query && (
              <p className="mt-3 text-xs text-slate-500">
                No categories match “{query}”; matching articles and tools are
                shown below.
              </p>
            )}
          </section>

          <section aria-labelledby="popular-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  POPULAR ARTICLES
                </p>
                <h2
                  id="popular-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  Most Searched Questions
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("help-faqs")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Articles
                <LuArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {popularFaqs.map((faq) => (
                <button
                  key={faq.question}
                  type="button"
                  onClick={() => choosePopularQuestion(faq.question)}
                  className="group flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left text-xs text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
                >
                  <LuFileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="flex-1">{faq.question}</span>
                  <LuArrowRight className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                </button>
              ))}
              {popularFaqs.length === 0 && (
                <p className="col-span-full rounded-lg border border-slate-100 p-4 text-xs text-slate-500">
                  No popular articles match this search. Try another term or
                  browse the tool guides below.
                </p>
              )}
            </div>
          </section>

          <section id="help-faqs" aria-labelledby="faqs-title" className="scroll-mt-24">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  FREQUENTLY ASKED QUESTIONS
                </p>
                <h2
                  id="faqs-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  FAQs
                </h2>
              </div>
              <div
                role="group"
                aria-label="Filter FAQs by category"
                className="flex flex-wrap gap-1.5"
              >
                {FAQ_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveFaqCategory(category)}
                    aria-pressed={activeFaqCategory === category}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${
                      activeFaqCategory === category
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm">
              {filteredFaqs.map((faq) => {
                const isOpen = openQuestion === faq.question;
                const answerId = `help-answer-${FAQS.indexOf(faq)}`;
                return (
                  <article key={faq.question} className="px-4">
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() =>
                          setOpenQuestion(isOpen ? null : faq.question)
                        }
                        className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm text-slate-800"
                      >
                        <span>{faq.question}</span>
                        <LuChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-500 transition ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <p
                        id={answerId}
                        className="max-w-4xl pb-4 pr-8 text-xs leading-relaxed text-slate-600"
                      >
                        {faq.answer}
                      </p>
                    )}
                  </article>
                );
              })}
              {filteredFaqs.length === 0 && (
                <p className="p-5 text-xs text-slate-500">
                  No FAQs match the current search and filters. Clear the
                  search or select All to see more answers.
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="tools-title">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  SEARCHABLE HOW-TO LIBRARY
                </p>
                <h2
                  id="tools-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  Tool Guides
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                {filteredTools.length} of {TOOLS_CATALOG.length} guides
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <article
                  key={tool.id}
                  className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold text-blue-600">
                        {tool.studioName}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-slate-900">
                        {tool.name}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600">
                      {tool.tier} tier
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {tool.description}
                  </p>
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-slate-700">
                      How to use
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      {tool.howItWorks}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                    <p className="min-w-0">
                      <span className="font-bold text-slate-700">Input: </span>
                      <span className="text-slate-500">{tool.inputFormat}</span>
                    </p>
                    <p className="min-w-0">
                      <span className="font-bold text-slate-700">Output: </span>
                      <span className="text-slate-500">{tool.outputFormat}</span>
                    </p>
                  </div>
                  <Link
                    href={tool.studioHref}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open {tool.studioName}
                    <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
              {filteredTools.length === 0 && (
                <p className="col-span-full rounded-xl border border-slate-100 p-5 text-xs text-slate-500">
                  No tool guides match. Try searching for a tool, file type, or
                  task such as “merge”, “DOCX”, “OCR”, or “QR”.
                </p>
              )}
            </div>
          </section>

          {(activeTopic === "all" || activeTopic === "billing") && (
            <section aria-labelledby="plans-title">
              <div className="mb-4">
                <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                  FREE AND PAID FEATURES
                </p>
                <h2
                  id="plans-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  Plans &amp; Pro Features
                </h2>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
                  Limits below come from the configured plan settings.
                  Individual tools may have additional tier requirements shown
                  in their guide.
                </p>
              </div>
              {filteredPlans.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlans.map(({ id, label, price, plan }) => (
                      <article
                        key={id}
                        className={`rounded-xl border p-4 ${
                          id !== "free"
                            ? "border-blue-200 bg-blue-50/40"
                            : "border-slate-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {label}
                          </h3>
                          <span className="text-xs font-bold text-blue-600">
                            {price}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                          <li>
                            {plan.maxFileMb} MB max file ·{" "}
                            {plan.maxPagesPerFile} pages per file
                          </li>
                          <li>{plan.storageGb} GB workspace storage</li>
                          <li>
                            {plan.quotas.aiCredits} AI ·{" "}
                            {plan.quotas.imageCredits} image credits ·{" "}
                            {plan.quotas.qrCodes} QR codes
                          </li>
                          <li>
                            {plan.seats} workspace{" "}
                            {plan.seats === 1 ? "seat" : "seats"} ·{" "}
                            {plan.retentionHours / 24} day output retention
                          </li>
                          {plan.features.priorityQueue && (
                            <li>Priority queue</li>
                          )}
                          {plan.features.svgExport && <li>SVG export</li>}
                          {plan.features.apiAccess && <li>API access</li>}
                          {plan.features.dedicatedSupport && (
                            <li>Dedicated support</li>
                          )}
                        </ul>
                      </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {showPaymentHelp && (
            <section
              aria-labelledby="billing-title"
              className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-white p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <LuCreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                    PAYMENTS &amp; SUBSCRIPTIONS
                  </p>
                  <h2
                    id="billing-title"
                    className="mt-1 text-lg font-bold text-slate-950"
                  >
                    Payment Gateway Help
                  </h2>
                  <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-600">
                    Checkout is integrated with Razorpay. The checkout currently
                    lists UPI, cards and NetBanking. Choose a plan and billing
                    cycle, complete the provider checkout, and check your
                    workspace plan status after payment. For failed payments,
                    duplicate charges, invoices, or plan questions, contact
                    support. Never share card security codes or UPI PINs.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0861f5] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    <LuMail className="h-4 w-4" />
                    Contact Support
                    <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {showSupport && (
            <section className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#f3f8ff] p-5 sm:flex-row sm:p-6">
              <div className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="hidden h-16 w-20 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm sm:flex"
                >
                  <LuLifeBuoy className="h-9 w-9" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-slate-400">
                    STILL NEED HELP?
                  </p>
                  <h2 className="mt-1 text-base font-bold text-slate-950">
                    Can&apos;t find the answer?
                  </h2>
                  <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-500">
                    Our support team is here to help. Reach out and we&apos;ll
                    get back to you as soon as possible.
                  </p>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0861f5] px-5 py-3 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Contact Support
                <LuArrowRight className="h-4 w-4" />
              </Link>
            </section>
          )}

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
