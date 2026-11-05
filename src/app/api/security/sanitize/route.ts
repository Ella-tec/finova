import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sanitizeFile } from "@/lib/security/sanitizer";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let fileName = "unknown";
    let mimeType = "";
    let size = 0;
    let textContent = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      textContent = (form.get("textHint") as string) || "";
      if (file) {
        fileName = file.name;
        mimeType = file.type;
        size = file.size;
        // Try read as text for csv/txt/json
        if (
          mimeType.includes("text") ||
          fileName.endsWith(".csv") ||
          fileName.endsWith(".txt") ||
          fileName.endsWith(".json")
        ) {
          try {
            textContent = (await file.text()).slice(0, 200_000);
          } catch {
            /* binary */
          }
        }
      }
    } else {
      const body = await req.json();
      fileName = body.fileName || "unknown";
      mimeType = body.mimeType || "";
      size = body.size || 0;
      textContent = body.textContent || body.textHint || "";
    }

    const result = sanitizeFile({ fileName, mimeType, size, textContent });

    await prisma.auditLog.create({
      data: {
        action: "FILE_SANITIZE_SCAN",
        entityType: "Security",
        details: JSON.stringify({
          fileName,
          classification: result.classification,
          safeToUpload: result.safeToUpload,
          safeForPublicAI: result.safeForPublicAI,
          findingCount: result.findings.length,
          piiTypes: result.piiHits.map((p) => p.type),
        }),
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Sanitize error:", err);
    return NextResponse.json({ error: "Sanitize failed" }, { status: 500 });
  }
}
