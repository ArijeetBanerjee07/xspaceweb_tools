import { NextRequest, NextResponse } from "next/server";
import { convertDocument, ConvertAction } from "@/lib/converter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

try {
  const canvas = require("@napi-rs/canvas");
  const DOMMatrixCtor = canvas.DOMMatrix || canvas.default?.DOMMatrix;
  const ImageDataCtor = canvas.ImageData || canvas.default?.ImageData;
  const Path2DCtor = canvas.Path2D || canvas.default?.Path2D;
  if (DOMMatrixCtor) {
    (global as any).DOMMatrix = DOMMatrixCtor;
    (globalThis as any).DOMMatrix = DOMMatrixCtor;
  }
  if (ImageDataCtor) {
    (global as any).ImageData = ImageDataCtor;
    (globalThis as any).ImageData = ImageDataCtor;
  }
  if (Path2DCtor) {
    (global as any).Path2D = Path2DCtor;
    (globalThis as any).Path2D = Path2DCtor;
  }
} catch (e) {
  console.warn("[Canvas polyfill warning in route]:", e);
}

const VALID_ACTIONS: ConvertAction[] = [
  "pdf-to-word",
  "word-to-pdf",
  "pdf-to-excel",
  "excel-to-pdf",
  "pdf-to-ppt",
  "ppt-to-pdf",
  "pdf-to-images",
  "images-to-pdf",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get("action") as ConvertAction | null;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Invalid conversion action. Supported: ${VALID_ACTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const filesList = (formData.getAll("files") as File[]).filter(Boolean);
    const singleFile = formData.get("file") as File | null;
    const allFiles = filesList.length > 0 ? filesList : (singleFile ? [singleFile] : []);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const firstFile = allFiles[0];
    const firstBuffer = Buffer.from(await firstFile.arrayBuffer());

    const additionalFiles = await Promise.all(
      allFiles.slice(1).map(async (f) => ({
        fileName: f.name || "file",
        buffer: Buffer.from(await f.arrayBuffer()),
      }))
    );

    const outputFileName = formData.get("outputFileName") as string | null;

    const result = await convertDocument(firstBuffer, firstFile.name || "document", action, additionalFiles, outputFileName);

    // Return the converted binary file stream
    return new Response(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(result.fileName)}"`,
        "x-filename": encodeURIComponent(result.fileName),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[CONVERT_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "File conversion failed. Please verify file format.", stack: error?.stack },
      { status: 500 }
    );
  }
}
