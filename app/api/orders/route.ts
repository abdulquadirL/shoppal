import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId query parameter is required" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId: customerId,
        status: "PENDING", // optional: limits to the active order
      },
      include: {
        shopper: true,
        customer: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Standardize output for frontend safety
    const cleanData = orders.map((o) => ({
      id: o.id,
      customerId: o.customerId,
      shopperId: o.shopperId,
      status: o.status,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: o.items ?? [],
      shopper: o.shopper
        ? {
            id: o.shopper.id,
            name: o.shopper.name,
            email: o.shopper.email
            
          }
        : null,
      customer: o.customer
        ? {
            id: o.customer.id,
            name: o.customer.name,
            email: o.customer.email,
            
          }
        : null,
    }));

    return NextResponse.json(cleanData);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
