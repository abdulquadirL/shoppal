import { NextRequest } from "next/server";
import { initIO } from "@/app/socket";

export const runtime = "nodejs";

let initialized = false;

export async function GET(req: NextRequest) {
  if (!initialized) {
    // @ts-ignore
    initIO(globalThis.__server);
    initialized = true;
  }

  return new Response("Socket initialized");
}
