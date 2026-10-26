export interface PublicTool {
  slug: string;
  name: string;
  category:
    | "PDF Organization"
    | "Optimize & OCR"
    | "Convert to PDF"
    | "Convert from PDF"
    | "Edit PDF"
    | "Security"
    | "AI & More";
  description: string;
  badge?: string;
  color?: string;
  accept: string;
  buttonText: string;
  dropText: string;
  actionText: string;
  successTitle: string;
  downloadText: string;
  optionsType:
    | "image-to-pdf"
    | "merge-pdf"
    | "split-pdf"
    | "compress-pdf"
    | "rotate-pdf"
    | "protect-pdf"
    | "watermark-pdf"
    | "convert-api"
    | "remove-pages"
    | "extract-pages"
    | "organize-pdf"
    | "reorder-pages"
    | "compress-to-100kb"
    | "optimize-pdf"
    | "add-page-numbers"
    | "crop-pdf"
    | "edit-pdf"
    | "pdf-forms"
    | "unlock-pdf"
    | "sign-pdf"
    | "redact-pdf"
    | "compare-pdf"
    | "ocr-pdf"
    | "pdf-to-jpg"
    | "image-converter";
  convertAction?: string;
}

export const MEGA_MENU_CATEGORIES = [
  {
    name: "PDF Organization",
    count: 7,
    color: "text-rose-500",
    bg: "bg-rose-50",
    tools: [
      { slug: "merge-pdf", name: "Merge PDF" },
      { slug: "split-pdf", name: "Split PDF" },
      { slug: "remove-pages", name: "Remove Pages" },
      { slug: "extract-pages", name: "Extract Pages" },
      { slug: "organize-pdf", name: "Organize PDF" },
      { slug: "scan-to-pdf", name: "Scan to PDF" },
      { slug: "reorder-pages", name: "Reorder Pages" },
    ],
  },
  {
    name: "Optimize & OCR",
    count: 4,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    tools: [
      { slug: "compress-pdf", name: "Compress PDF" },
      { slug: "repair-pdf", name: "Compress to 100KB" },
      { slug: "ocr-pdf", name: "OCR PDF" },
      { slug: "optimize-pdf", name: "Optimize PDF" },
    ],
  },
  {
    name: "Convert to PDF",
    count: 6,
    color: "text-amber-500",
    bg: "bg-amber-50",
    tools: [
      { slug: "jpg-to-pdf", name: "JPG to PDF" },
      { slug: "word-to-pdf", name: "Word to PDF" },
      { slug: "powerpoint-to-pdf", name: "PowerPoint to PDF" },
      { slug: "html-to-pdf", name: "HTML to PDF" },
      { slug: "excel-to-pdf", name: "Excel to PDF" },
      { slug: "text-to-pdf", name: "Text to PDF" },
    ],
  },
  {
    name: "Convert from PDF",
    count: 6,
    color: "text-blue-500",
    bg: "bg-blue-50",
    tools: [
      { slug: "pdf-to-jpg", name: "PDF to JPG" },
      { slug: "pdf-to-word", name: "PDF to Word" },
      { slug: "pdf-to-powerpoint", name: "PDF to PowerPoint" },
      { slug: "pdf-to-excel", name: "PDF to Excel" },
      { slug: "pdf-to-pdfa", name: "PDF to PDF/A" },
      { slug: "pdf-to-text", name: "PDF to Text" },
    ],
  },
  {
    name: "Edit PDF",
    count: 6,
    color: "text-purple-500",
    bg: "bg-purple-50",
    tools: [
      { slug: "rotate-pdf", name: "Rotate PDF" },
      { slug: "add-page-numbers", name: "Add Page Numbers" },
      { slug: "add-watermark", name: "Add Watermark" },
      { slug: "crop-pdf", name: "Crop PDF" },
      { slug: "mark-pdf", name: "Edit PDF" },
      { slug: "pdf-forms", name: "PDF Forms" },
    ],
  },
  {
    name: "Security",
    count: 5,
    color: "text-sky-500",
    bg: "bg-sky-50",
    tools: [
      { slug: "unlock-pdf", name: "Unlock PDF" },
      { slug: "protect-pdf", name: "Protect PDF" },
      { slug: "sign-pdf", name: "Sign PDF" },
      { slug: "redact-pdf", name: "Redact PDF" },
      { slug: "compare-pdf", name: "Compare PDF" },
    ],
  },
  {
    name: "AI & More",
    count: 6,
    color: "text-pink-500",
    bg: "bg-pink-50",
    tools: [
      { slug: "ai-summarizer", name: "AI Summarizer" },
      { slug: "translate-pdf", name: "Translate PDF" },
      { slug: "pdf-to-markdown", name: "PDF to Markdown" },
      { slug: "chat-with-pdf", name: "Chat with PDF" },
      { slug: "qr-code-generator", name: "QR Code Generator" },
      { slug: "image-upscaler", name: "Image Upscaler" },
    ],
  },
];

export const PUBLIC_TOOLS: Record<string, PublicTool> = {
  "jpg-to-pdf": {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    category: "Convert to PDF",
    description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    accept: "image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp",
    buttonText: "Select JPG images",
    dropText: "or drop JPG images here",
    actionText: "Convert to PDF",
    successTitle: "The images have been converted to PDF",
    downloadText: "Download PDF",
    optionsType: "image-to-pdf",
  },
  "merge-pdf": {
    slug: "merge-pdf",
    name: "Merge PDF",
    category: "PDF Organization",
    description: "Combine multiple PDF files into one single organized document with full page preview.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF files",
    dropText: "or drop PDF files here",
    actionText: "Merge PDF",
    successTitle: "The PDF files have been merged",
    downloadText: "Download Merged PDF",
    optionsType: "merge-pdf",
  },
  "split-pdf": {
    slug: "split-pdf",
    name: "Split PDF",
    category: "PDF Organization",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Split PDF",
    successTitle: "The PDF has been split into pages",
    downloadText: "Download Split Pages",
    optionsType: "split-pdf",
  },
  "compress-pdf": {
    slug: "compress-pdf",
    name: "Compress PDF",
    category: "Optimize & OCR",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Compress PDF",
    successTitle: "The PDF has been compressed",
    downloadText: "Download Compressed PDF",
    optionsType: "compress-pdf",
  },
  "pdf-to-word": {
    slug: "pdf-to-word",
    name: "PDF to Word",
    category: "Convert from PDF",
    description: "Convert PDF documents to editable Microsoft Word DOCX files with maintained formatting.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Convert to Word",
    successTitle: "The PDF has been converted to DOCX",
    downloadText: "Download Word File",
    optionsType: "convert-api",
    convertAction: "pdf-to-word",
  },
  "word-to-pdf": {
    slug: "word-to-pdf",
    name: "Word to PDF",
    category: "Convert to PDF",
    description: "Convert DOC and DOCX documents to standard print-ready PDF files.",
    accept: ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword",
    buttonText: "Select Word files",
    dropText: "or drop Word documents here",
    actionText: "Convert to PDF",
    successTitle: "The Word file has been converted to PDF",
    downloadText: "Download PDF",
    optionsType: "convert-api",
    convertAction: "word-to-pdf",
  },
  "pdf-to-excel": {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    category: "Convert from PDF",
    description: "Extract tabular data and financial statements straight from PDF to Microsoft Excel XLSX.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Convert to Excel",
    successTitle: "The PDF tables have been extracted to Excel",
    downloadText: "Download Excel File",
    optionsType: "convert-api",
    convertAction: "pdf-to-excel",
  },
  "excel-to-pdf": {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    category: "Convert to PDF",
    description: "Convert Excel spreadsheets (.xlsx, .xls) to clean PDF reports.",
    accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
    buttonText: "Select Excel files",
    dropText: "or drop Excel files here",
    actionText: "Convert to PDF",
    successTitle: "The Excel spreadsheet has been converted to PDF",
    downloadText: "Download PDF",
    optionsType: "convert-api",
    convertAction: "excel-to-pdf",
  },
  "pdf-to-powerpoint": {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    category: "Convert from PDF",
    description: "Turn your PDF presentations into editable PPTX slides.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Convert to PPTX",
    successTitle: "The PDF has been converted to PowerPoint",
    downloadText: "Download PowerPoint",
    optionsType: "convert-api",
    convertAction: "pdf-to-ppt",
  },
  "powerpoint-to-pdf": {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    category: "Convert to PDF",
    description: "Convert PowerPoint slide decks (.pptx, .ppt) into standard PDF documents.",
    accept: ".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    buttonText: "Select PowerPoint files",
    dropText: "or drop PPTX files here",
    actionText: "Convert to PDF",
    successTitle: "The presentation has been converted to PDF",
    downloadText: "Download PDF",
    optionsType: "convert-api",
    convertAction: "ppt-to-pdf",
  },
  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    category: "Convert from PDF",
    description: "Extract every page of a PDF file into high-definition JPG images.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Convert to JPG",
    successTitle: "The PDF pages have been converted to JPG images",
    downloadText: "Download JPG Images",
    optionsType: "pdf-to-jpg",
    convertAction: "pdf-to-images",
  },
  "rotate-pdf": {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    category: "Edit PDF",
    description: "Rotate specific pages or all pages of your PDF 90, 180, or 270 degrees.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Rotate PDF",
    successTitle: "The PDF has been rotated",
    downloadText: "Download Rotated PDF",
    optionsType: "rotate-pdf",
  },
  "protect-pdf": {
    slug: "protect-pdf",
    name: "Protect PDF",
    category: "Security",
    description: "Encrypt and lock your PDF document with a secure owner password.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Protect PDF",
    successTitle: "The PDF has been encrypted & locked",
    downloadText: "Download Protected PDF",
    optionsType: "protect-pdf",
  },
  "unlock-pdf": {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    category: "Security",
    description: "Remove security and restrictions from password-protected PDF files.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Unlock PDF",
    successTitle: "The PDF has been unlocked",
    downloadText: "Download Unlocked PDF",
    optionsType: "unlock-pdf",
  },
  "add-watermark": {
    slug: "add-watermark",
    name: "Add Watermark",
    category: "Edit PDF",
    description: "Stamp text or confidential markings onto every page of your PDF.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Add Watermark",
    successTitle: "Watermark applied to PDF",
    downloadText: "Download Watermarked PDF",
    optionsType: "watermark-pdf",
  },
  "add-page-numbers": {
    slug: "add-page-numbers",
    name: "Add Page Numbers",
    category: "Edit PDF",
    description: "Insert customizable page numbers and numbering styles into your PDF pages.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Add Page Numbers",
    successTitle: "Page numbers added to PDF",
    downloadText: "Download Numbered PDF",
    optionsType: "add-page-numbers",
  },
  "remove-pages": {
    slug: "remove-pages",
    name: "Remove Pages",
    category: "PDF Organization",
    description: "Delete unwanted pages from your PDF file and save a clean version.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Remove Pages",
    successTitle: "Pages removed successfully",
    downloadText: "Download Clean PDF",
    optionsType: "remove-pages",
  },
  "delete-pages": {
    slug: "remove-pages",
    name: "Remove Pages",
    category: "PDF Organization",
    description: "Delete unwanted pages from your PDF file and save a clean version.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Remove Pages",
    successTitle: "Pages removed successfully",
    downloadText: "Download Clean PDF",
    optionsType: "remove-pages",
  },
  "extract-pages": {
    slug: "extract-pages",
    name: "Extract Pages",
    category: "PDF Organization",
    description: "Extract specific pages from your PDF document into a new standalone PDF.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Extract Pages",
    successTitle: "Pages extracted successfully",
    downloadText: "Download Extracted PDF",
    optionsType: "extract-pages",
  },
  "organize-pdf": {
    slug: "organize-pdf",
    name: "Organize PDF",
    category: "PDF Organization",
    description: "Reorder, rotate, delete, or duplicate pages in your PDF document with a visual canvas.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Save Organized PDF",
    successTitle: "PDF organized successfully",
    downloadText: "Download Organized PDF",
    optionsType: "organize-pdf",
  },
  "reorder-pages": {
    slug: "reorder-pages",
    name: "Reorder Pages",
    category: "PDF Organization",
    description: "Rearrange, reorder, and sort pages in your PDF document with a visual canvas.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Save Reordered PDF",
    successTitle: "PDF reordered successfully",
    downloadText: "Download Reordered PDF",
    optionsType: "reorder-pages",
  },
  "reorder": {
    slug: "reorder-pages",
    name: "Reorder Pages",
    category: "PDF Organization",
    description: "Rearrange, reorder, and sort pages in your PDF document with a visual canvas.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Save Reordered PDF",
    successTitle: "PDF reordered successfully",
    downloadText: "Download Reordered PDF",
    optionsType: "reorder-pages",
  },
  "scan-to-pdf": {
    slug: "scan-to-pdf",
    name: "Scan to PDF",
    category: "Convert to PDF",
    description: "Convert scanned documents, photos, and camera shots into clean, high-quality PDF files.",
    accept: "image/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.heic",
    buttonText: "Select Scanned Documents",
    dropText: "or drop document scans here",
    actionText: "Process Scan to PDF",
    successTitle: "Scanned documents converted to PDF",
    downloadText: "Download Scanned PDF",
    optionsType: "image-to-pdf",
  },
  "compress-to-100kb": {
    slug: "repair-pdf",
    name: "Compress to 100KB",
    category: "Optimize & OCR",
    description: "Intelligently scale and compress your PDF to under 100KB for easy email attachments and web upload limits.",
    accept: ".pdf,application/pdf",
    buttonText: "Choose PDF to compress",
    dropText: "or drop PDF file here",
    actionText: "Compress to under 100KB",
    successTitle: "PDF compressed under 100KB",
    downloadText: "Download 100KB PDF",
    optionsType: "compress-to-100kb",
  },
  "repair-pdf": {
    slug: "repair-pdf",
    name: "Compress to 100KB",
    category: "Optimize & OCR",
    description: "Intelligently scale and compress your PDF to under 100KB for easy email attachments and web upload limits.",
    accept: ".pdf,application/pdf",
    buttonText: "Choose PDF to compress",
    dropText: "or drop PDF file here",
    actionText: "Compress to under 100KB",
    successTitle: "PDF compressed under 100KB",
    downloadText: "Download 100KB PDF",
    optionsType: "compress-to-100kb",
  },
  "optimize-pdf": {
    slug: "optimize-pdf",
    name: "Optimize PDF",
    category: "Optimize & OCR",
    description: "Streamline PDF documents with tailored profiles for web fast view, print fidelity, or lossless stream compression.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Optimize",
    dropText: "or drop PDF file here",
    actionText: "Optimize PDF",
    successTitle: "PDF optimized successfully",
    downloadText: "Download Optimized PDF",
    optionsType: "optimize-pdf",
  },
  "ocr-pdf": {
    slug: "ocr-pdf",
    name: "OCR PDF",
    category: "Optimize & OCR",
    description: "Transform scanned documents and image-based PDFs into searchable, selectable text or export editable documents.",
    accept: ".pdf,image/*,application/pdf",
    buttonText: "Select Scanned Document",
    dropText: "or drop scanned PDF or image here",
    actionText: "Process OCR PDF",
    successTitle: "OCR Recognition Complete",
    downloadText: "Download OCR Result",
    optionsType: "ocr-pdf",
  },
  "pdf-to-text": {
    slug: "pdf-to-text",
    name: "PDF to Text",
    category: "Convert from PDF",
    description: "Extract clean, structured raw text directly from PDF documents with layout preservation.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Extract Text",
    successTitle: "Text extracted from PDF",
    downloadText: "Download Text File",
    optionsType: "convert-api",
    convertAction: "pdf-to-text",
  },
  "crop-pdf": {
    slug: "crop-pdf",
    name: "Crop PDF",
    category: "Edit PDF",
    description: "Trim unwanted white margins, crop headers and footers, or adjust viewport borders with pixel precision.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Crop",
    dropText: "or drop PDF file here",
    actionText: "Crop PDF Now",
    successTitle: "PDF cropped successfully",
    downloadText: "Download Cropped PDF",
    optionsType: "crop-pdf",
  },
  "mark-pdf": {
    slug: "mark-pdf",
    name: "Edit PDF",
    category: "Edit PDF",
    description: "Annotate, mark up, type text stamps, highlight sections, and add callout badges onto your PDF pages in real-time.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Edit",
    dropText: "or drop PDF file here",
    actionText: "Save Edited PDF",
    successTitle: "PDF edited successfully",
    downloadText: "Download Edited PDF",
    optionsType: "edit-pdf",
  },
  "edit-pdf": {
    slug: "mark-pdf",
    name: "Edit PDF",
    category: "Edit PDF",
    description: "Annotate, mark up, type text stamps, highlight sections, and add callout badges onto your PDF pages in real-time.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Edit",
    dropText: "or drop PDF file here",
    actionText: "Save Edited PDF",
    successTitle: "PDF edited successfully",
    downloadText: "Download Edited PDF",
    optionsType: "edit-pdf",
  },
  "pdf-forms": {
    slug: "pdf-forms",
    name: "PDF Forms",
    category: "Edit PDF",
    description: "Fill interactive PDF form fields, inspect form data, and flatten or export fillable documents.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF Form",
    dropText: "or drop PDF file here",
    actionText: "Save & Flatten Form",
    successTitle: "PDF form completed successfully",
    downloadText: "Download Completed Form",
    optionsType: "pdf-forms",
  },
  "sign-pdf": {
    slug: "sign-pdf",
    name: "Sign PDF",
    category: "Security",
    description: "Electronically sign PDF documents with drawn or typed verified signatures.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Sign PDF Document",
    successTitle: "PDF signed successfully",
    downloadText: "Download Signed PDF",
    optionsType: "sign-pdf",
  },
  "redact-pdf": {
    slug: "redact-pdf",
    name: "Redact PDF",
    category: "Security",
    description: "Permanently black out and redact confidential text and sensitive sections.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF file",
    dropText: "or drop PDF file here",
    actionText: "Redact PDF Now",
    successTitle: "Sensitive information redacted",
    downloadText: "Download Redacted PDF",
    optionsType: "redact-pdf",
  },
  "compare-pdf": {
    slug: "compare-pdf",
    name: "Compare PDF",
    category: "Security",
    description: "Compare two PDF documents side by side to detect structural and page differences.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF files to Compare",
    dropText: "or drop 2 PDF files here",
    actionText: "Generate Comparison Report",
    successTitle: "PDF Comparison Complete",
    downloadText: "Download Comparison Report",
    optionsType: "compare-pdf",
  },
  "ai-summarizer": {
    slug: "ai-summarizer",
    name: "AI Summarizer",
    category: "AI & More",
    description: "Generate instant bulleted executive summaries and key insights from any PDF using advanced AI.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Summarize",
    dropText: "or drop PDF file here",
    actionText: "Summarize PDF with AI",
    successTitle: "Summary Generated Successfully",
    downloadText: "Download Summary",
    optionsType: "merge-pdf",
  },
  "translate-pdf": {
    slug: "translate-pdf",
    name: "Translate PDF",
    category: "AI & More",
    description: "Translate your PDF documents into 50+ languages while preserving original formatting.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Translate",
    dropText: "or drop PDF file here",
    actionText: "Translate PDF Document",
    successTitle: "Document Translated Successfully",
    downloadText: "Download Translated PDF",
    optionsType: "merge-pdf",
  },
  "pdf-to-markdown": {
    slug: "pdf-to-markdown",
    name: "PDF to Markdown",
    category: "AI & More",
    description: "Extract clean, structured Markdown, code blocks, and tables from PDF documents using AI.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF for Markdown",
    dropText: "or drop PDF file here",
    actionText: "Convert PDF to Markdown",
    successTitle: "Markdown Extracted Successfully",
    downloadText: "Download Markdown (.md)",
    optionsType: "merge-pdf",
  },
  "chat-with-pdf": {
    slug: "chat-with-pdf",
    name: "Chat with PDF",
    category: "AI & More",
    description: "Ask grounded questions, query clauses, and receive cited answers from your document using AI.",
    accept: ".pdf,application/pdf",
    buttonText: "Select PDF to Chat",
    dropText: "or drop PDF file here",
    actionText: "Start AI Chat Session",
    successTitle: "AI Document Session Ready",
    downloadText: "Download Chat Transcript",
    optionsType: "merge-pdf",
  },
  "qr-code-generator": {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "AI & More",
    description: "Generate customized high-resolution QR codes with custom colors, logos, and frames.",
    accept: ".pdf,image/*",
    buttonText: "Open QR Generator",
    dropText: "or generate instant QR code",
    actionText: "Generate Custom QR Code",
    successTitle: "QR Code Generated",
    downloadText: "Download QR Code",
    optionsType: "merge-pdf",
  },
  "image-upscaler": {
    slug: "image-upscaler",
    name: "Image Upscaler",
    category: "AI & More",
    description: "Enhance resolution and clarity of images and document scans up to 4x using AI super-resolution.",
    accept: "image/*,.jpg,.jpeg,.png,.webp",
    buttonText: "Select Image to Upscale",
    dropText: "or drop image file here",
    actionText: "Upscale Image with AI",
    successTitle: "Image Upscaled Successfully",
    downloadText: "Download High-Res Image",
    optionsType: "image-to-pdf",
  },
  "image-converter": {
    slug: "image-converter",
    name: "Image Conversion",
    category: "AI & More",
    description: "Convert images freely between JPG, PNG, and modern WebP formats in seconds with client-side privacy.",
    accept: "image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.avif",
    buttonText: "Select Images to Convert",
    dropText: "or drop images here",
    actionText: "Convert Images Now",
    successTitle: "Images Converted Successfully",
    downloadText: "Download Converted Image",
    optionsType: "image-converter",
  },
};

export const AI_TOOL_ROUTES: Record<string, string> = {
  "ai-summarizer": "/app/studios/ai-document?tool=summarize-pdf",
  "translate-pdf": "/app/studios/ai-document?tool=doc-translate",
  "pdf-to-markdown": "/app/studios/ai-document?tool=markdown-export",
  "chat-with-pdf": "/app/studios/ai-document?tool=chat-pdf",
  "image-upscaler": "/app/studios/compress",
  "qr-code-generator": "/app/studios/qr-link",
};

export const AI_TOOL_SLUGS = new Set([
  "ai-summarizer",
  "translate-pdf",
  "pdf-to-markdown",
  "chat-with-pdf",
  "image-upscaler",
]);

export function getToolLink(slug: string, isAuthenticated: boolean = false): string {
  const targetStudio = AI_TOOL_ROUTES[slug];
  if (targetStudio) {
    if (isAuthenticated) {
      return targetStudio;
    }
    return `/signup?redirect=${encodeURIComponent(targetStudio)}&feature=${slug}`;
  }
  return `/tools/${slug}`;
}

export function getPublicTool(slug: string): PublicTool {
  const normalized = slug.toLowerCase().trim();
  if (normalized === "reorder" || normalized === "reorder-pages") {
    return PUBLIC_TOOLS["reorder-pages"];
  }
  if (
    normalized === "repair-pdf" ||
    normalized === "compress-to-100kb" ||
    normalized === "compress-100k"
  ) {
    return PUBLIC_TOOLS["compress-to-100kb"];
  }
  if (normalized === "optimize" || normalized === "optimize-pdf") {
    return PUBLIC_TOOLS["optimize-pdf"];
  }
  if (normalized === "crop" || normalized === "crop-pdf") {
    return PUBLIC_TOOLS["crop-pdf"];
  }
  if (
    normalized === "mark" ||
    normalized === "mark-pdf" ||
    normalized === "edit" ||
    normalized === "edit-pdf"
  ) {
    return PUBLIC_TOOLS["mark-pdf"];
  }
  if (
    normalized === "form" ||
    normalized === "forms" ||
    normalized === "pdf-form" ||
    normalized === "pdf-forms" ||
    normalized === "fill-form"
  ) {
    return PUBLIC_TOOLS["pdf-forms"];
  }
  if (normalized === "page-numbers" || normalized === "add-page-numbers") {
    return PUBLIC_TOOLS["add-page-numbers"];
  }
  if (normalized === "unlock" || normalized === "unlock-pdf") {
    return PUBLIC_TOOLS["unlock-pdf"];
  }
  if (
    normalized === "protect" ||
    normalized === "protect-pdf" ||
    normalized === "lock" ||
    normalized === "lock-pdf" ||
    normalized === "encrypt-pdf"
  ) {
    return PUBLIC_TOOLS["protect-pdf"];
  }
  if (normalized === "sign" || normalized === "sign-pdf") {
    return PUBLIC_TOOLS["sign-pdf"];
  }
  if (normalized === "redact" || normalized === "redact-pdf") {
    return PUBLIC_TOOLS["redact-pdf"];
  }
  if (normalized === "compare" || normalized === "compare-pdf") {
    return PUBLIC_TOOLS["compare-pdf"];
  }
  if (normalized === "ocr" || normalized === "ocr-pdf") {
    return PUBLIC_TOOLS["ocr-pdf"];
  }
  if (normalized === "pdf-to-text" || normalized === "pdf-text") {
    return PUBLIC_TOOLS["pdf-to-text"];
  }
  if (
    normalized === "image-converter" ||
    normalized === "convert-image" ||
    normalized === "image-conversion" ||
    normalized === "convert-images"
  ) {
    return PUBLIC_TOOLS["image-converter"];
  }
  if (PUBLIC_TOOLS[normalized]) {
    return PUBLIC_TOOLS[normalized];
  }

  // Fallback defaults for any unrecognized slug
  const title = normalized
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const isImg =
    normalized.includes("image") ||
    normalized.includes("jpg") ||
    normalized.includes("scan") ||
    normalized.includes("photo");

  const isReorder = normalized.includes("reorder");
  const isOrg = normalized.includes("organize");

  return {
    slug: normalized,
    name: title,
    category: "Convert to PDF",
    description: `Process and convert documents with ${title} in seconds. Fast, private, and 100% free.`,
    accept: isImg ? "image/*,.jpg,.jpeg,.png,.webp,.bmp" : (isOrg || isReorder) ? ".pdf,application/pdf" : ".pdf,image/*,.docx,.xlsx,.pptx,application/pdf",
    buttonText: `Select files for ${title}`,
    dropText: "or drop files here",
    actionText: `Process ${title}`,
    successTitle: `Files processed with ${title}`,
    downloadText: "Download Result",
    optionsType: isImg ? "image-to-pdf" : isReorder ? "reorder-pages" : isOrg ? "organize-pdf" : "merge-pdf",
  };
}
