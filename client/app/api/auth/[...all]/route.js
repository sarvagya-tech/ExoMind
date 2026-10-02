import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request) {
  const url = new URL(request.url);
  const target = `${BACKEND_URL}${url.pathname}${url.search}`;
  return NextResponse.redirect(target);
}

export async function POST(request) {
  const url = new URL(request.url);
  const target = `${BACKEND_URL}${url.pathname}${url.search}`;
  return NextResponse.redirect(target, 307);
}
