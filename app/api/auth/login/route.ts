import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  //const user = await prisma.user.findUnique({ where: { email } });

  const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    passwordHash: true, // ✅ explicitly include
  },
});


  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  return NextResponse.json({ user });
}
