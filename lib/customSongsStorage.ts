export type PackageChoice = "song_only" | "song_video";

export type OrderData = {
  packageChoice?: PackageChoice;

  name?: string;
  email?: string;
  phone?: string;

  occasion?: string;
  recipientName?: string;
  relationship?: string;
  vibe?: string;
  genre?: string;
  tempo?: string;
  mustInclude?: string;
  notes?: string;

  photoCount?: string;
  photoNotes?: string;
};

export const STORAGE_KEY = "customSongsOrder_v3";

export function sanitize(data: OrderData): OrderData {
  const out: OrderData = { ...data };

  // Strip any old “demo defaults” or autofills you don’t want saved
  const lower = (s?: string) => (s ?? "").trim().toLowerCase();

  if (lower(out.name) === "gary") out.name = "";
  if (lower(out.occasion) === "birthday") out.occasion = "";
  if (lower(out.vibe) === "warm & hopeful") out.vibe = "";
  if (lower(out.genre) === "country") out.genre = "";

  return out;
}

export function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitize(JSON.parse(raw) as OrderData);
  } catch {
    return {};
  }
}

export function saveOrder(next: OrderData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function mergeOrder(patch: Partial<OrderData>) {
  const current = loadOrder();
  const next = sanitize({ ...current, ...patch });
  saveOrder(next);
  return next;
}
