import type { DailySummary, Trip, Vehicle } from "@/lib/contracts";

export const sampleVehicles: Vehicle[] = [
  {
    id: "veh_circle_madina",
    plate: "GT 4821-24",
    ownerName: "Kojo Mensah",
    route: "Circle–Madina",
  },
  {
    id: "veh_kaneshie_central",
    plate: "GR 1503-23",
    ownerName: "Ama Ofori",
    route: "Kaneshie–Accra Central",
  },
  {
    id: "veh_tema_adenta",
    plate: "GW 7319-22",
    ownerName: "Yaw Boateng",
    route: "Tema Station–Adenta",
  },
];

const DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

function formatDateAccra(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function buildDateAtHour(base: Date, hour: number, minute: number) {
  const d = new Date(base);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

export const todayAccra = formatDateAccra(new Date());

function makeTripsForVehicle(vehicle: Vehicle, vehicleIndex: number): Trip[] {
  const trips: Trip[] = [];

  for (let dayOffset = DAYS - 1; dayOffset >= 0; dayOffset -= 1) {
    const baseDate = new Date(Date.now() - dayOffset * DAY_MS);
    const dateIso = formatDateAccra(baseDate);

    const tripCount = 6 + ((vehicleIndex + dayOffset) % 5);
    const isAnomalyDay = vehicle.id === "veh_tema_adenta" && dayOffset === 0;

    for (let tripIndex = 0; tripIndex < tripCount; tripIndex += 1) {
      const normalAmount = 15 + ((vehicleIndex * 7 + dayOffset * 3 + tripIndex * 2) % 21);
      const amount = isAnomalyDay ? Math.max(10, normalAmount - 11) : normalAmount;

      const hour = 6 + (tripIndex % 8);
      const minute = (tripIndex * 7 + dayOffset * 5) % 60;

      trips.push({
        id: `trip_${vehicle.id}_${dateIso}_${tripIndex}`,
        vehicleId: vehicle.id,
        amount,
        route: vehicle.route,
        loggedAt: buildDateAtHour(baseDate, hour, minute).toISOString(),
        rawVoiceText: `${vehicle.route}, ${amount} cedis`,
        confidence: tripIndex % 6 === 0 ? "medium" : "high",
      });
    }
  }

  return trips;
}

export const sampleTrips: Trip[] = sampleVehicles.flatMap(makeTripsForVehicle);

export function getVehicleById(vehicleId: string) {
  return sampleVehicles.find((vehicle) => vehicle.id === vehicleId);
}

export function getTripsForVehicleDate(vehicleId: string, date: string): Trip[] {
  return sampleTrips
    .filter((trip) => trip.vehicleId === vehicleId && formatDateAccra(new Date(trip.loggedAt)) === date)
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
}

export function getTripsForVehicle(vehicleId: string): Trip[] {
  return sampleTrips
    .filter((trip) => trip.vehicleId === vehicleId)
    .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
}

export function summarizeTrips(vehicleId: string, date: string): DailySummary {
  const trips = getTripsForVehicleDate(vehicleId, date);
  const total = Number(trips.reduce((sum, trip) => sum + trip.amount, 0).toFixed(2));
  const tripCount = trips.length;
  const avgPerTrip = tripCount ? Number((total / tripCount).toFixed(2)) : 0;

  const recentDates = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(Date.now() - index * DAY_MS);
    return formatDateAccra(d);
  });

  const sevenDayTotals = recentDates.map((recentDate) =>
    getTripsForVehicleDate(vehicleId, recentDate).reduce((sum, trip) => sum + trip.amount, 0),
  );

  const sevenDayAverage =
    sevenDayTotals.length > 0
      ? sevenDayTotals.reduce((sum, value) => sum + value, 0) / sevenDayTotals.length
      : 0;

  const anomaly = total < sevenDayAverage * 0.7;

  return {
    vehicleId,
    date,
    total,
    tripCount,
    avgPerTrip,
    aiNote: anomaly
      ? "Today's earnings are below the recent average."
      : "Revenue is tracking normally today.",
    anomaly,
  };
}

export function getDailySummariesForVehicle(vehicleId: string, days = 7): DailySummary[] {
  return Array.from({ length: days })
    .map((_, index) => {
      const d = new Date(Date.now() - (days - index - 1) * DAY_MS);
      return formatDateAccra(d);
    })
    .map((date) => summarizeTrips(vehicleId, date));
}

export function getTodaySummaryForVehicle(vehicleId: string): DailySummary {
  return summarizeTrips(vehicleId, todayAccra);
}

export const sampleSummaries: DailySummary[] = sampleVehicles.map((vehicle) =>
  getTodaySummaryForVehicle(vehicle.id),
);
