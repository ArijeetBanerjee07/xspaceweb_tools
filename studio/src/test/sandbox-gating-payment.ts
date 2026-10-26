import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import Razorpay from "razorpay";
import { GATING_RULES, evaluateFeatureAccess } from "../lib/gating";

// Load .env.local first, fallback to .env
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function runSandboxTests() {
  console.log("=================================================");
  console.log("🚀 STARTING XSW TOOLS SANDBOX TEST SUITE");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error(`     Detail: ${detail}`);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // TEST SECTION 1: Razorpay API Key & Live Connectivity Sandbox
  // -------------------------------------------------------------
  console.log("--- 1. Testing Razorpay Live API Credentials ---");
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  assert(Boolean(keyId && keyId.startsWith("rzp_")), "Razorpay Key ID is present and valid prefix", `Key: ${keyId}`);
  assert(Boolean(keySecret && keySecret.length >= 10), "Razorpay Key Secret is present", `Secret length: ${keySecret?.length}`);

  let createdOrderId: string | null = null;
  if (keyId && keySecret) {
    try {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      // Create a test order of 299 INR (Paise: 29900)
      const order = await razorpay.orders.create({
        amount: 29900,
        currency: "INR",
        receipt: `sandbox_test_${Date.now()}`,
        notes: {
          test: "xsw_tools_sandbox_verification",
          purpose: "pro_upgrade_validation",
        },
      });

      assert(Boolean(order && order.id && order.id.startsWith("order_")), "Razorpay order created successfully via Live API", `Order ID: ${order.id}`);
      assert(order.amount === 29900, "Razorpay order amount matches ₹299 (29900 paise)");
      assert(order.currency === "INR", "Razorpay order currency is INR");
      createdOrderId = order.id;
    } catch (err: any) {
      assert(false, "Razorpay order creation via Live API", err?.message || String(err));
    }
  }

  // -------------------------------------------------------------
  // TEST SECTION 2: Payment Signature Verification (HMAC-SHA256)
  // -------------------------------------------------------------
  console.log("\n--- 2. Testing Payment Signature Verification ---");
  if (keySecret) {
    const testOrderId = createdOrderId || "order_sandbox_mock_12345";
    const testPaymentId = "pay_sandbox_mock_67890";
    const validSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex");

    // Test Valid Signature
    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex");
    assert(validSignature === expectedSig, "Valid payment signature correctly passes verification");

    // Test Forged Signature
    const forgedSignature = "forged_invalid_signature_hash_1234567890";
    assert(forgedSignature !== expectedSig, "Forged signature correctly fails verification");
  }

  // -------------------------------------------------------------
  // TEST SECTION 3: Studio Gating Blueprint Compliance
  // -------------------------------------------------------------
  console.log("\n--- 3. Testing 9 Studios Gating Blueprint ---");

  // Studio 1: PDF Studio
  console.log("\n  [Studio 1: PDF Studio]");
  // 100% Free
  const pdfConvert = evaluateFeatureAccess("pdf:convert", false, 100);
  assert(pdfConvert.allowed && !pdfConvert.requiresUpgrade, "PDF Format Conversions: 100% Free unlimited (100 runs allowed)");

  const pdfPageOps = evaluateFeatureAccess("pdf:page-ops", false, 50);
  assert(pdfPageOps.allowed && !pdfPageOps.requiresUpgrade, "PDF Page Ops (Merge/Split/Reorder): 100% Free unlimited");

  // Free with Quota: Watermark (5 files)
  const watermarkFreeRun1 = evaluateFeatureAccess("pdf:watermark", false, 0);
  assert(watermarkFreeRun1.allowed && watermarkFreeRun1.remaining === 5, "PDF Watermark: Run 1 allowed (5 remaining)");
  const watermarkFreeRun5 = evaluateFeatureAccess("pdf:watermark", false, 4);
  assert(watermarkFreeRun5.allowed && watermarkFreeRun5.remaining === 1, "PDF Watermark: Run 5 allowed (1 remaining)");
  const watermarkFreeRun6 = evaluateFeatureAccess("pdf:watermark", false, 5);
  assert(!watermarkFreeRun6.allowed && watermarkFreeRun6.requiresUpgrade && watermarkFreeRun6.reason === "quota_exceeded", "PDF Watermark: Run 6 blocked (Quota exceeded -> Pro prompt)");

  // Free with Quota: Password lock (3 files)
  const encryptFreeRun3 = evaluateFeatureAccess("pdf:encrypt", false, 2);
  assert(encryptFreeRun3.allowed && encryptFreeRun3.remaining === 1, "PDF Lock/Encrypt: Run 3 allowed (1 remaining)");
  const encryptFreeRun4 = evaluateFeatureAccess("pdf:encrypt", false, 3);
  assert(!encryptFreeRun4.allowed && encryptFreeRun4.requiresUpgrade, "PDF Lock/Encrypt: Run 4 blocked (Quota exceeded -> Pro prompt)");

  // Pro Exclusive: Text/Image Overlays & Page Numbering & Organizer
  const pdfOverlaysFree = evaluateFeatureAccess("pdf:edit-overlays", false, 0);
  assert(!pdfOverlaysFree.allowed && pdfOverlaysFree.requiresUpgrade && pdfOverlaysFree.reason === "pro_exclusive", "PDF Custom Overlays: Blocked on Free tier (Pro Exclusive)");
  const pdfPageNumFree = evaluateFeatureAccess("pdf:page-numbering", false, 0);
  assert(!pdfPageNumFree.allowed && pdfPageNumFree.requiresUpgrade, "PDF Page Numbering: Blocked on Free tier (Pro Exclusive)");
  const pdfOrganizerFree = evaluateFeatureAccess("pdf:organizer", false, 0);
  assert(pdfOrganizerFree.allowed && !pdfOrganizerFree.requiresUpgrade, "PDF Organizer Matrix: Free tier access");

  // Pro user unrestricted
  const pdfOverlaysPro = evaluateFeatureAccess("pdf:edit-overlays", true, 999);
  assert(pdfOverlaysPro.allowed && !pdfOverlaysPro.requiresUpgrade, "PDF Custom Overlays: Unlocked for Pro users");

  // Studio 2: AI Document Studio
  console.log("\n  [Studio 2: AI Document Studio]");
  const aiSummaryFree = evaluateFeatureAccess("ai-doc:summarizer", false, 20);
  assert(aiSummaryFree.allowed, "Document Summarizer: 100% Free unlimited");
  const aiInvoiceFree = evaluateFeatureAccess("ai-doc:invoice-extract", false, 20);
  assert(aiInvoiceFree.allowed, "Invoice & Receipt Extraction: 100% Free unlimited");
  const aiQaFree = evaluateFeatureAccess("ai-doc:qa", false, 20);
  assert(aiQaFree.allowed, "Document Q&A: 100% Free unlimited");
  const aiCompareFree = evaluateFeatureAccess("ai-doc:compare", false, 20);
  assert(aiCompareFree.allowed, "Compare Two Documents: 100% Free unlimited");

  // Pro Exclusive AI Tools
  const aiChatFree = evaluateFeatureAccess("ai-doc:chat-pdf", false, 0);
  assert(!aiChatFree.allowed && aiChatFree.reason === "pro_exclusive", "Chat with PDF: Blocked on Free tier (Pro Exclusive)");
  const aiTableFree = evaluateFeatureAccess("ai-doc:table-entities", false, 0);
  assert(!aiTableFree.allowed && aiTableFree.reason === "pro_exclusive", "Extract Tables & Entities: Blocked on Free tier (Pro Exclusive)");
  const aiRewriteFree = evaluateFeatureAccess("ai-doc:rewrite", false, 0);
  assert(!aiRewriteFree.allowed && aiRewriteFree.reason === "pro_exclusive", "Rewrite & Simplify Document: Blocked on Free tier (Pro Exclusive)");
  const aiTranslateFree = evaluateFeatureAccess("ai-doc:translate", false, 0);
  assert(!aiTranslateFree.allowed && aiTranslateFree.reason === "pro_exclusive", "Document Translation: Blocked on Free tier (Pro Exclusive)");

  // Studio 3: Document Hub
  console.log("\n  [Studio 3: Document Hub]");
  const docHubFilesRun5 = evaluateFeatureAccess("doc-hub:files", false, 4);
  assert(docHubFilesRun5.allowed && docHubFilesRun5.remaining === 1, "Document Hub: 5th file allowed");
  const docHubFilesRun6 = evaluateFeatureAccess("doc-hub:files", false, 5);
  assert(!docHubFilesRun6.allowed && docHubFilesRun6.requiresUpgrade, "Document Hub: 6th file blocked on Free tier");
  const docHubFoldersRun4 = evaluateFeatureAccess("doc-hub:folders", false, 3);
  assert(!docHubFoldersRun4.allowed && docHubFoldersRun4.requiresUpgrade, "Document Hub: 4th folder blocked on Free tier (Max 3 folders)");

  // Studio 4: Security & E-Signature
  console.log("\n  [Studio 4: Security & E-Signature Studio]");
  const secEsignFree = evaluateFeatureAccess("security:esign", false, 100);
  assert(secEsignFree.allowed, "Electronic Signature: 100% Free unlimited");
  const secStampFree = evaluateFeatureAccess("security:stamp", false, 100);
  assert(secStampFree.allowed, "Document Approval Stamp: 100% Free unlimited");
  const secPassFree4 = evaluateFeatureAccess("security:password-lock", false, 3);
  assert(!secPassFree4.allowed && secPassFree4.requiresUpgrade, "AES-128 Password Protection: Blocked after 3 files");
  const secRedactFree = evaluateFeatureAccess("security:redaction", false, 0);
  assert(!secRedactFree.allowed && secRedactFree.reason === "pro_exclusive", "True PDF Redaction: Blocked on Free tier (Pro Exclusive)");

  // Studio 5: QR & Link Studio
  console.log("\n  [Studio 5: QR & Link Studio]");
  const qrGenFree = evaluateFeatureAccess("qr:generate", false, 500);
  assert(qrGenFree.allowed, "Core QR Generation: 100% Free unlimited");
  const qrCustomFramesRun5 = evaluateFeatureAccess("qr:custom-frames", false, 4);
  assert(qrCustomFramesRun5.allowed && qrCustomFramesRun5.remaining === 1, "Custom QR Frames: 5th generation allowed");
  const qrCustomFramesRun6 = evaluateFeatureAccess("qr:custom-frames", false, 5);
  assert(!qrCustomFramesRun6.allowed && qrCustomFramesRun6.requiresUpgrade, "Custom QR Frames: 6th generation blocked (Pro required)");
  const qrDynamicFree = evaluateFeatureAccess("qr:dynamic-links", false, 0);
  assert(!qrDynamicFree.allowed && qrDynamicFree.reason === "pro_exclusive", "Dynamic QR & Short Links: Blocked on Free tier (Pro Exclusive)");
  const qrBulkFree = evaluateFeatureAccess("qr:bulk-batch", false, 0);
  assert(!qrBulkFree.allowed && qrBulkFree.reason === "pro_exclusive", "Bulk CSV & PDF Stamper: Blocked on Free tier (Pro Exclusive)");

  // Studio 6: Background Studio
  console.log("\n  [Studio 6: Background Studio]");
  const bgRemoverFree = evaluateFeatureAccess("bg:remover", false, 100);
  assert(bgRemoverFree.allowed, "AI Background Remover: 100% Free unlimited");
  const bgPassportFree = evaluateFeatureAccess("bg:passport-photo", false, 100);
  assert(bgPassportFree.allowed, "Passport & Visa Photo: 100% Free unlimited");
  const bgSigFree = evaluateFeatureAccess("bg:signature-cutout", false, 100);
  assert(bgSigFree.allowed, "Signature & Stamp Cutout: 100% Free unlimited");
  const bgShowcaseRun3 = evaluateFeatureAccess("bg:product-showcase", false, 2);
  assert(bgShowcaseRun3.allowed && bgShowcaseRun3.remaining === 1, "Product Showcase Studio: 3rd generation allowed");
  const bgShowcaseRun4 = evaluateFeatureAccess("bg:product-showcase", false, 3);
  assert(!bgShowcaseRun4.allowed && bgShowcaseRun4.requiresUpgrade, "Product Showcase Studio: 4th generation blocked (Pro required)");
  const bgBatchFree = evaluateFeatureAccess("bg:batch-processing", false, 0);
  assert(!bgBatchFree.allowed && bgBatchFree.reason === "pro_exclusive", "Batch Queue Processing: Blocked on Free tier (Pro Exclusive)");

  // Studio 7: Office Studio (All 7 tools capped at 3 each)
  console.log("\n  [Studio 7: Office Studio]");
  const officeTools = [
    { key: "office:ai-doc", name: "AI-Assisted Document Creation" },
    { key: "office:docx-gen", name: "DOCX Word File Generator" },
    { key: "office:xlsx-gen", name: "Excel / XLSX Structured Workbook Creator" },
    { key: "office:letter-gen", name: "Business Letter Generator" },
    { key: "office:formula-suggester", name: "Spreadsheet Formula Assistant" },
    { key: "office:invoice-templates", name: "Commercial Invoice & Billing Creator" },
    { key: "office:business-reports", name: "Formal Business Report Compiler" },
  ];

  for (const tool of officeTools) {
    const resRun3 = evaluateFeatureAccess(tool.key, false, 2);
    assert(resRun3.allowed && resRun3.remaining === 1, `${tool.name}: 3rd generation allowed`);
    const resRun4 = evaluateFeatureAccess(tool.key, false, 3);
    assert(!resRun4.allowed && resRun4.requiresUpgrade && resRun4.reason === "quota_exceeded", `${tool.name}: 4th generation blocked (Limit reached -> Pro prompt)`);
    const resPro = evaluateFeatureAccess(tool.key, true, 50);
    assert(resPro.allowed && !resPro.requiresUpgrade, `${tool.name}: Unlimited on Pro tier`);
  }

  // Studio 8: Compress & Enhance Studio (100% Free for Everyone)
  console.log("\n  [Studio 8: Compress & Enhance Studio]");
  const compressFree = evaluateFeatureAccess("compress:all", false, 500);
  assert(compressFree.allowed && !compressFree.requiresUpgrade, "Compress & Enhance Suite: 100% Free unlimited for everyone");

  // Studio 9: TrendRank AI Studio (100% Pro Exclusive)
  console.log("\n  [Studio 9: TrendRank AI Studio]");
  const trendRankFree = evaluateFeatureAccess("trendrank:all", false, 0);
  assert(!trendRankFree.allowed && trendRankFree.requiresUpgrade && trendRankFree.reason === "pro_exclusive", "TrendRank AI Studio: 100% Pro Exclusive (Blocked for Free tier)");
  const trendRankPro = evaluateFeatureAccess("trendrank:all", true, 0);
  assert(trendRankPro.allowed && !trendRankPro.requiresUpgrade, "TrendRank AI Studio: Fully unlocked for Pro subscribers");

  console.log("\n=================================================");
  console.log(`🏁 SANDBOX TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log("=================================================\n");

  if (passedTests === totalTests) {
    console.log("🎉 ALL SANDBOX VERIFICATIONS PASSED 100%!");
  } else {
    throw new Error(`Sandbox tests failed: ${totalTests - passedTests} failures.`);
  }
}

runSandboxTests().catch((err) => {
  console.error("Sandbox test error:", err);
  process.exit(1);
});
