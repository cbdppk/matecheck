import { neon } from "@neondatabase/serverless";
import { sampleTrips, sampleVehicles, summarizeTrips, todayAccra } from "@/lib/sampleData";

const DATABASE_URL = process.env.DATABASE_URL;

function missingSql() {
  throw new Error("DATABASE_URL is not set. Add it to .env.local before using Neon queries.");
}

export const sql = DATABASE_URL ? neon(DATABASE_URL) : (missingSql as unknown as ReturnType<typeof neon>);

export function isDbConfigured() {
  return Boolean(DATABASE_URL);
}

export async function createTables() {
  if (!isDbConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      plate TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      route TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
      amount NUMERIC(10,2) NOT NULL,
      route TEXT NOT NULL,
      logged_at TIMESTAMPTZ DEFAULT NOW(),
      raw_voice_text TEXT,
      confidence TEXT DEFAULT 'high' CHECK (confidence IN ('high','medium','low'))
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_summary (
      vehicle_id TEXT NOT NULL,
      date DATE NOT NULL,
      total NUMERIC(10,2) DEFAULT 0,
      trip_count INT DEFAULT 0,
      avg_per_trip NUMERIC(10,2) DEFAULT 0,
      ai_note TEXT,
      anomaly BOOLEAN DEFAULT FALSE,
      PRIMARY KEY (vehicle_id, date)
    );
  `;
}

export async function seedDatabase() {
  if (!isDbConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const existing = await sql`SELECT COUNT(*)::int AS count FROM vehicles;`;
  const count = existing[0]?.count ?? 0;

  if (count > 0) {
    return { seeded: false, reason: "vehicles already exist" };
  }

  for (const vehicle of sampleVehicles) {
    await sql`
      INSERT INTO vehicles (id, plate, owner_name, route)
      VALUES (${vehicle.id}, ${vehicle.plate}, ${vehicle.ownerName}, ${vehicle.route})
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  for (const trip of sampleTrips) {
    await sql`
      INSERT INTO trips (id, vehicle_id, amount, route, logged_at, raw_voice_text, confidence)
      VALUES (
        ${trip.id},
        ${trip.vehicleId},
        ${trip.amount},
        ${trip.route},
        ${trip.loggedAt},
        ${trip.rawVoiceText ?? null},
        ${trip.confidence}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  for (const vehicle of sampleVehicles) {
    const summary = summarizeTrips(vehicle.id, todayAccra);

    await sql`
      INSERT INTO daily_summary (vehicle_id, date, total, trip_count, avg_per_trip, ai_note, anomaly)
      VALUES (
        ${summary.vehicleId},
        ${summary.date},
        ${summary.total},
        ${summary.tripCount},
        ${summary.avgPerTrip},
        ${summary.aiNote ?? null},
        ${summary.anomaly}
      )
      ON CONFLICT (vehicle_id, date)
      DO UPDATE SET
        total = EXCLUDED.total,
        trip_count = EXCLUDED.trip_count,
        avg_per_trip = EXCLUDED.avg_per_trip,
        ai_note = EXCLUDED.ai_note,
        anomaly = EXCLUDED.anomaly;
    `;
  }

  return { seeded: true };
}
