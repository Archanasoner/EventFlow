import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";

export async function GET() {
  let event = await prisma.event.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
    },
  });

  if (!event) {
    const owner = await prisma.user.upsert({
      where: { email: "demo@planner.local" },
      update: {},
      create: { name: "Demo Planner", email: "demo@planner.local" },
    });

    event = await prisma.event.create({
      data: {
        title: "Rooftop Launch Night",
        date: new Date("2026-08-21T18:30:00.000Z"),
        venue: "Skyline Hall",
        budgetLimit: 25000,
        ownerId: owner.id,
        layoutItems: [
          { id: randomUUID(), type: "stage", label: "Stage", x: 420, y: 56, width: 220, height: 86, rotation: 0, color: "#0f766e", cost: 1800 },
          { id: randomUUID(), type: "table", label: "VIP Table", x: 150, y: 195, width: 132, height: 96, rotation: 0, color: "#2563eb", cost: 450 },
          { id: randomUUID(), type: "bar", label: "Mocktail Bar", x: 660, y: 270, width: 150, height: 84, rotation: 0, color: "#ea580c", cost: 1200 },
          { id: randomUUID(), type: "dance", label: "Dance Floor", x: 330, y: 390, width: 220, height: 132, rotation: 0, color: "#0891b2", cost: 1500 },
        ],
        guests: [
          { id: randomUUID(), name: "Aarav Mehta", email: "aarav@example.com", group: "VIP", seatItem: "VIP Table", status: "confirmed" },
          { id: randomUUID(), name: "Maya Shah", email: "maya@example.com", group: "Press", seatItem: null, status: "confirmed" },
          { id: randomUUID(), name: "Rehan Kapoor", email: "rehan@example.com", group: "Team", seatItem: null, status: "invited" },
        ],
        vendors: [
          { id: randomUUID(), name: "Aurora Lights", category: "Lighting", cost: 3200, status: "booked" },
          { id: randomUUID(), name: "Fresh Plate Co.", category: "Catering", cost: 8800, status: "booked" },
        ],
        collaborators: [],
      },
      include: {
        owner: true,
      },
    });
  }

  return NextResponse.json(event);
}

export async function POST(request: Request) {
  const body = await request.json();
  const owner = await prisma.user.upsert({
    where: { email: body.ownerEmail ?? "demo@planner.local" },
    update: { name: body.ownerName ?? "Demo Planner" },
    create: {
      name: body.ownerName ?? "Demo Planner",
      email: body.ownerEmail ?? "demo@planner.local",
    },
  });

  const event = await prisma.event.create({
    data: {
      title: body.title ?? "Untitled Event",
      venue: body.venue ?? "New Venue",
      date: body.date ? new Date(body.date) : new Date(),
      budgetLimit: Number(body.budgetLimit ?? 10000),
      ownerId: owner.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
