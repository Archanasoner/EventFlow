import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { apiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        venue: body.venue,
        date: body.date === undefined ? undefined : new Date(body.date),
        budgetLimit: body.budgetLimit === undefined ? undefined : Number(body.budgetLimit),
        layoutItems: Array.isArray(body.layoutItems)
          ? body.layoutItems.map((item: any) => ({
              id: item.id ?? randomUUID(),
              type: item.type,
              label: item.label,
              x: Math.round(item.x),
              y: Math.round(item.y),
              width: Math.round(item.width),
              height: Math.round(item.height),
              rotation: Math.round(item.rotation ?? 0),
              color: item.color,
              cost: Math.round(item.cost ?? 0),
            }))
          : undefined,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        venue: body.venue,
        date: new Date(body.date),
        budgetLimit: body.budgetLimit,
        layoutItems: [],
      },
    });

    return Response.json(newEvent);
  } catch (error) {
    return Response.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}