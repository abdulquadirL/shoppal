// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import {prisma} from "@/lib/prisma";

// export async function POST(req: NextRequest) {
//   try {
//     const { name, email, password, role } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password required" }, { status: 400 });
//     }

//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

//     const hash = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { name, email, passwordHash: hash, role: role ?? "CUSTOMER" },
//     });

//     return NextResponse.json(user);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ success: true });
}
