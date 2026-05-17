import { type NextRequest } from "next/server";
import { getSessionToken } from "@/lib/session";
import { API_URL } from "@/lib/env";
import { requireMe } from "@/lib/dal";

export async function GET(
  request: NextRequest,
  { params }: { params: { providerId: string; docId: string } },
) {
  try {
    // 1. Authenticate user
    await requireMe();

    const token = await getSessionToken();
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { providerId, docId } = params;

    // 2. Fetch the document file from API backend
    const res = await fetch(
      `${API_URL}/api/v1/providers/${providerId}/documents/${docId}/file`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      return new Response("File not found or access denied", { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = res.headers.get("content-disposition") || "attachment";

    // 3. Return the binary body back to the client
    const fileBuffer = await res.arrayBuffer();

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (err) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
