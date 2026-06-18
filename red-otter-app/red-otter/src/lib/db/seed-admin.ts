import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@otis.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

async function seedAdmin() {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });

  if (existing) {
    // Update to admin if not already
    if (existing.role !== "admin") {
      await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
      console.log(`Updated ${ADMIN_EMAIL} to admin role.`);
    } else {
      console.log(`${ADMIN_EMAIL} is already an admin.`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.insert(users).values({
    email: ADMIN_EMAIL,
    name: "Admin",
    passwordHash,
    role: "admin",
    subscriptionStatus: "active",
  });

  console.log(`Created admin user: ${ADMIN_EMAIL}`);
}

seedAdmin().catch(console.error);
