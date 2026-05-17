import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const vendor = {
    id: randomUUID(),
    name: body.name,
    category: body.category || "General",
    cost: Number(body.cost || 0),
    status: body.status || "quoted",
  };

  await prisma.event.update({
    where: { id },
    data: {
      vendors: {
        push: vendor,
      },
    },
  });

  return NextResponse.json(vendor, { status: 201 });
}
