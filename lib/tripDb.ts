import type { DailySummary, Trip, Vehicle } from "@/lib/contracts";
import { sql } from "@/lib/db";
import { getLastNDatesAccra, getTodayAccra } from "@/lib/accraDate";

function sqlRows(result: unknown): Record<string, unknown>[] {
  return result as Record<string, unknown>[];
}

export function mapTripRow(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id),
    vehicleId: String(row.vehicle_id),
    amount: Number(row.amount),
    route: String(row.route),
    loggedAt: new Date(row.logged_at as string | Date).toISOString(),
    rawVoiceText: row.raw_voice_text ? String(row.raw_voice_text) : undefined,
    confidence: row.confidence as Trip["confidence"],
  };
}

/** Calendar day in Accra, comparing against YYYY-MM-DD */
export async function fetchTripsForVehicleOnDate(
  vehicleId: string,
  date: string,
): Promise<Trip[]> {
  const rows = await sql`
    SELECT id, vehicle_id, amount, route, logged_at, raw_voice_text, confidence
    FROM trips
    WHERE vehicle_id = ${vehicleId}
      AND (logged_at AT TIME ZONE 'Africa/Accra')::date = ${date}::date
    ORDER BY logged_at DESC;
  `;
  return sqlRows(rows).map((row) => mapTripRow(row));
}

export async function fetchDailyTotalsLastDays(
  vehicleId: string,
  dates: string[],
): Promise<Map<string, { total: number; tripCount: number }>> {
  const map = new Map<string, { total: number; tripCount: number }>();
  if (dates.length === 0) {
    return map;
  }

  const start = dates[0];
  const end = dates[dates.length - 1];

  const rows = await sql`
    SELECT
      (logged_at AT TIME ZONE 'Africa/Accra')::date AS day,
      SUM(amount) AS total,
      COUNT(*)::int AS trip_count
    FROM trips
    WHERE vehicle_id = ${vehicleId}
      AND (logged_at AT TIME ZONE 'Africa/Accra')::date >= ${start}::date
      AND (logged_at AT TIME ZONE 'Africa/Accra')::date <= ${end}::date
    GROUP BY (logged_at AT TIME ZONE 'Africa/Accra')::date
    ORDER BY day ASC;
  `;

  for (const row of sqlRows(rows)) {
    const key = String(row.day);
    map.set(key, {
      total: Number(row.total),
      tripCount: Number(row.trip_count),
    });
  }

  return map;
}

function anomalyForDay(
  total: number,
  allTotals: number[],
  dayIndex: number,
): boolean {
  if (allTotals.length === 0) {
    return false;
  }
  const others = allTotals.filter((_, i) => i !== dayIndex);
  if (others.length === 0) {
    return false;
  }
  const avg = others.reduce((a, b) => a + b, 0) / others.length;
  if (avg <= 0) {
    return false;
  }
  return total < avg * 0.7;
}

export async function buildDailySummariesForLastWeek(
  vehicleId: string,
): Promise<DailySummary[]> {
  const dates = getLastNDatesAccra(7);
  const byDay = await fetchDailyTotalsLastDays(vehicleId, dates);
  const totals = dates.map((d) => byDay.get(d)?.total ?? 0);

  return dates.map((date, index) => {
    const row = byDay.get(date);
    const total = row?.total ?? 0;
    const tripCount = row?.tripCount ?? 0;
    const avgPerTrip = tripCount ? Number((total / tripCount).toFixed(2)) : 0;
    return {
      vehicleId,
      date,
      total,
      tripCount,
      avgPerTrip,
      anomaly: anomalyForDay(total, totals, index),
    };
  });
}

export async function computeDailySummaryDb(
  vehicleId: string,
  date: string,
): Promise<DailySummary> {
  const trips = await fetchTripsForVehicleOnDate(vehicleId, date);
  const total = Number(trips.reduce((sum, t) => sum + t.amount, 0).toFixed(2));
  const tripCount = trips.length;
  const avgPerTrip = tripCount ? Number((total / tripCount).toFixed(2)) : 0;

  const recentRows = await sql`
    SELECT (logged_at AT TIME ZONE 'Africa/Accra')::date AS day, SUM(amount) AS daily_total
    FROM trips
    WHERE vehicle_id = ${vehicleId}
      AND logged_at >= NOW() - INTERVAL '8 days'
    GROUP BY (logged_at AT TIME ZONE 'Africa/Accra')::date
    ORDER BY day DESC
    LIMIT 14;
  `;

  const recentTotals = sqlRows(recentRows).map((r) => Number(r.daily_total));
  const recentAverage =
    recentTotals.length > 0
      ? recentTotals.reduce((a, b) => a + b, 0) / recentTotals.length
      : 0;

  const anomaly = recentAverage > 0 && total < recentAverage * 0.7;

  return {
    vehicleId,
    date,
    total,
    tripCount,
    avgPerTrip,
    anomaly,
  };
}

export type FleetItem = { vehicle: Vehicle; summary: DailySummary };

export async function getFleetFromDb(): Promise<FleetItem[]> {
  const today = getTodayAccra();
  const vehicleRows = await sql`
    SELECT id, plate, owner_name, route
    FROM vehicles
    ORDER BY plate ASC;
  `;

  const items: FleetItem[] = [];
  for (const row of sqlRows(vehicleRows)) {
    const vehicle: Vehicle = {
      id: String(row.id),
      plate: String(row.plate),
      ownerName: String(row.owner_name),
      route: String(row.route),
    };
    const summary = await computeDailySummaryDb(vehicle.id, today);
    items.push({ vehicle, summary });
  }
  return items;
}
