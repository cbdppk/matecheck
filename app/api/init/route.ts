import { NextResponse } from "next/server";
import { createTables, isDbConfigured, seedDatabase } from "@/lib/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "DATABASE_URL is missing. Add it to .env.local first." },
      { status: 400 },
    );
  }

  try {
    await createTables();
    await seedDatabase();

    return NextResponse.json({ success: true, message: "DB ready" });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Could not initialize database",
      },
      { status: 500 },
    );
  }
}
