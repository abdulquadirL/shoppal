// app/api/socket/route.ts
import { NextRequest } from "next/server"
import { initIO } from "@/app/socket"

// Ensure this API route runs on the Node.js runtime (not Edge)
export const runtime = "nodejs"

// Optional: disable static caching
export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest) {
  try {
    // Initialize the Socket.IO server if not already started
    initIO()

    return new Response(
      JSON.stringify({ status: "ok", message: "Socket.IO server initialized" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (err) {
    console.error("Error initializing socket server:", err)
    return new Response(
      JSON.stringify({ error: "Socket initialization failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
