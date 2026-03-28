/**
 * Known trotro routes in Ghana.
 * Used to populate the route dropdown on the driver log screen.
 * The driver's "default route" is persisted in localStorage.
 */

export const KNOWN_ROUTES: string[] = [
  // Kumasi
  "Kejetia–Santase",
  "Kejetia–Tech",
  "Kejetia–Adum",
  "Kejetia–Angola",
  "Kejetia–Effiduasi",
  "Kejetia–Ejisu",
  "Kejetia–Abuakwa",
  "Kejetia–Tanoso",
  "Kejetia–Suame",
  "Kejetia–Maxima",
  "Kejetia–Bantama",
  "Angola–Tech",
  "Adum–Tanoso",
  "Adum–Santase",
  "Adum–Suame",
  "Suame–Kejetia",
  // Accra
  "Circle–Madina",
  "Circle–Lapaz",
  "Circle–Achimota",
  "Circle–Legon",
  "Circle–Adenta",
  "Kaneshie–Accra Central",
  "Kaneshie–Lapaz",
  "Kasoa–Circle",
  "Tema Station–Adenta",
  "Spintex–Circle",
  "Dansoman–Circle",
  "Mallam–Circle",
  "Achimota–Madina",
];

const STORAGE_KEY = "matecheck:defaultRoute";

export function getDefaultRoute(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function setDefaultRoute(route: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, route);
}
