import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "demo@planner.local" },
    update: {},
    create: {
      name: "Demo Planner",
      email: "demo@planner.local",
    },
  });

  await prisma.event.deleteMany({
    where: { ownerId: owner.id },
  });

  await prisma.event.create({
    data: {
      title: "Rooftop Launch Night",
      date: new Date("2026-08-21T18:30:00.000Z"),
      venue: "Skyline Hall",
      budgetLimit: 25000,
      ownerId: owner.id,
      layoutItems: [
        { id: randomUUID(), type: "stage", label: "Stage", x: 420, y: 56, width: 220, height: 86, rotation: 0, color: "#0f766e", cost: 1800 },
        { id: randomUUID(), type: "table", label: "VIP Table", x: 150, y: 195, width: 132, height: 96, rotation: 0, color: "#2563eb", cost: 450 },
        { id: randomUUID(), type: "table", label: "Press Table", x: 365, y: 220, width: 132, height: 96, rotation: 0, color: "#7c3aed", cost: 450 },
        { id: randomUUID(), type: "bar", label: "Mocktail Bar", x: 660, y: 270, width: 150, height: 84, rotation: 0, color: "#ea580c", cost: 1200 },
        { id: randomUUID(), type: "booth", label: "Photo Booth", x: 72, y: 410, width: 132, height: 96, rotation: 0, color: "#db2777", cost: 900 },
        { id: randomUUID(), type: "dance", label: "Dance Floor", x: 330, y: 390, width: 220, height: 132, rotation: 0, color: "#0891b2", cost: 1500 },
      ],
      guests: [
        { id: randomUUID(), name: "Aarav Mehta", email: "aarav@example.com", group: "VIP", seatItem: "VIP Table", status: "confirmed" },
        { id: randomUUID(), name: "Maya Shah", email: "maya@example.com", group: "Press", seatItem: "Press Table", status: "confirmed" },
        { id: randomUUID(), name: "Rehan Kapoor", email: "rehan@example.com", group: "Team", seatItem: null, status: "invited" },
        { id: randomUUID(), name: "Isha Rao", email: "isha@example.com", group: "Sponsor", seatItem: null, status: "confirmed" },
      ],
      vendors: [
        { id: randomUUID(), name: "Aurora Lights", category: "Lighting", cost: 3200, status: "booked" },
        { id: randomUUID(), name: "Fresh Plate Co.", category: "Catering", cost: 8800, status: "booked" },
        { id: randomUUID(), name: "FrameLab", category: "Photography", cost: 2100, status: "quoted" },
      ],
      collaborators: [
        { id: randomUUID(), email: "designer@planner.local", role: "editor" },
        { id: randomUUID(), email: "client@planner.local", role: "viewer" },
      ],
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
