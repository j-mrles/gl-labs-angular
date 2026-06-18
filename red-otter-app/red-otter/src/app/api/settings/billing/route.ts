import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createBillingPortalSession } from "@/lib/stripe/helpers";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing information on file. Please subscribe to a plan first." },
      { status: 400 },
    );
  }

  const url = await createBillingPortalSession(user.stripeCustomerId);

  return NextResponse.json({ url });
}
