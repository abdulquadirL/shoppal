import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new Response("No file", { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return new Response("File too large", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name);
  const name = crypto.randomUUID() + ext;

  const uploadDir = path.join(process.cwd(), "public/uploads");
  const filePath = path.join(uploadDir, name);

  await writeFile(filePath, buffer);

  return Response.json({
    url: `/uploads/${name}`,
    name: file.name,
    type: file.type,
  });
}
