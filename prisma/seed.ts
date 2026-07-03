import { PrismaClient, Role, ProjectStatus, ConsultationMode, ConsultationStatus } from "@prisma/client";
import { PRODUCTS } from "../src/lib/data/products";
import { DESIGNERS } from "../src/lib/data/designers";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TOBEEZ INTERIOR database…");

  // Clean slate
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.consultation.deleteMany();
  await db.estimate.deleteMany();
  await db.project.deleteMany();
  await db.review.deleteMany();
  await db.designer.deleteMany();
  await db.product.deleteMany();
  await db.user.deleteMany();

  // Admin
  await db.user.create({
    data: { email: "admin@tobeez.interior", name: "Tobi Ezeh", role: Role.ADMIN },
  });

  // Client
  const client = await db.user.create({
    data: { email: "jane@example.com", name: "Jane Doe", role: Role.CLIENT, phone: "+2348000000001" },
  });

  // Designers (from mock roster)
  const designers = [];
  for (const d of DESIGNERS) {
    const user = await db.user.create({
      data: {
        email: `${d.name.toLowerCase().replace(/\s+/g, ".")}@tobeez.interior`,
        name: d.name,
        role: Role.DESIGNER,
      },
    });
    const designer = await db.designer.create({
      data: {
        userId: user.id,
        title: d.title,
        rating: d.rating,
        projectsDone: d.projects,
        hourlyRate: d.rate,
        specialties: JSON.stringify(d.specialties),
      },
    });
    designers.push(designer);
  }

  // Products
  await db.product.createMany({
    data: PRODUCTS.map((p) => ({
      name: p.name, brand: p.brand, category: p.category,
      price: p.price, rating: p.rating, reviews: p.reviews, tag: p.tag ?? null,
    })),
  });

  // Projects for the client
  const project = await db.project.create({
    data: {
      name: "Lekki Duplex Furnishing", ownerId: client.id,
      status: ProjectStatus.IN_PROGRESS, budget: 18_500_000, progress: 62, category: "residential",
    },
  });
  await db.project.create({
    data: { name: "Ikoyi Office Fit-out", ownerId: client.id, status: ProjectStatus.PLANNING, budget: 9_200_000, progress: 20, category: "commercial" },
  });

  // Estimate
  await db.estimate.create({
    data: {
      userId: client.id, projectId: project.id,
      input: JSON.stringify({ category: "residential", buildingType: "Duplex", floorAreaSqm: 220, style: "luxury" }),
      currency: "NGN", recommended: 18_500_000, min: 16_200_000, max: 21_800_000,
    },
  });

  // Consultation
  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  await db.consultation.create({
    data: {
      clientId: client.id, designerId: designers[0].id,
      mode: ConsultationMode.VIRTUAL, status: ConsultationStatus.CONFIRMED,
      scheduledAt: soon, amount: designers[0].hourlyRate, meetingUrl: "https://meet.example.com/tobeez-demo",
    },
  });

  console.log("✅ Seed complete:", {
    users: await db.user.count(),
    designers: await db.designer.count(),
    products: await db.product.count(),
    projects: await db.project.count(),
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
