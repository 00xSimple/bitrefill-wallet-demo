import { NextRequest, NextResponse } from "next/server";

const BITREFILL_API = "https://api.bitrefill.com/v2";

const TEST_API_KEY = "fGG2dyNkL5Ua08MouISzZYM0FZfhUN3y383NfRHzGOU";

function getApiKey(): string {
  return process.env.BITREFILL_API_KEY || TEST_API_KEY;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path.join("/"), "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path.join("/"), "POST");
}

async function proxy(
  req: NextRequest,
  path: string,
  method: string
): Promise<NextResponse> {
  const apiKey = getApiKey();
  const url = `${BITREFILL_API}/${path}${buildQueryString(req)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const body = method !== "GET" ? await req.text() : undefined;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Proxy error" },
      { status: 502 }
    );
  }
}

function buildQueryString(req: NextRequest): string {
  const qs = req.nextUrl.searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
