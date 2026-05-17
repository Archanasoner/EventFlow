import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const guest = {
    id: randomUUID(),
    name: body.name,
    email: body.email || null,
    group: body.group || "General",
    seatItem: body.seatItem || null,
    status: body.status || "invited",
  };

  const event = await prisma.event.update({
    where: { id },
    data: {
      guests: {
        push: guest,
      },
    },
    include: {
      owner: true,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
