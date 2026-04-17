import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const contentPath = path.join(process.cwd(), "content", "site.json");

function getContent() {
  return JSON.parse(readFileSync(contentPath, "utf-8"));
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getContent());
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    writeFileSync(contentPath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save content:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
