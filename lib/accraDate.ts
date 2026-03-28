const DAY_MS = 24 * 60 * 60 * 1000;

export function getTodayAccra(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Oldest → newest (today last), same cadence as sampleData weekly views */
export function getLastNDatesAccra(days: number): string[] {
  return Array.from({ length: days }).map((_, index) => {
    const d = new Date(Date.now() - (days - index - 1) * DAY_MS);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Accra",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  });
}
