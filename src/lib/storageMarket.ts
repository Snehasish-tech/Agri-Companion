export interface StorageBooking {
  id: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  facilityState: string;
  commodity: string;
  bookedKg: number;
  remainingKg: number;
  soldKg: number;
  startDate: string;
  durationMonths: number;
  expiresAt: string;
  pricePerQuintal: number;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageListing {
  id: string;
  userId: string;
  storageBookingId: string;
  name: string;
  category: string;
  quantityKg: number;
  availableKg: number;
  pricePerKg: number;
  location: string;
  quality: string;
  status: "active" | "negotiating" | "sold";
  listedDate: string;
  image: string;
  inquiries: number;
  description?: string;
}

interface CreateStorageBookingInput {
  userId: string;
  facilityId: string;
  facilityName: string;
  facilityLocation: string;
  facilityState: string;
  commodity: string;
  bookedQuintal: number;
  startDate: string;
  durationMonths: number;
  pricePerQuintal: number;
  contactName: string;
  contactPhone: string;
}

interface CreateStorageListingInput {
  userId: string;
  storageBookingId: string;
  quantityKg: number;
  pricePerKg: number;
  quality: string;
  category: string;
  description?: string;
}

const STORAGE_BOOKINGS_KEY = "agri.storageBookings.v1";
const STORAGE_LISTINGS_KEY = "agri.storageListings.v1";
const STORAGE_EVENT_KEY = "agri-storage-market-updated";

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getBookings(): StorageBooking[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<StorageBooking[]>(window.localStorage.getItem(STORAGE_BOOKINGS_KEY), []);
}

function setBookings(bookings: StorageBooking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  notifyStorageMarketUpdated();
}

function getListings(): StorageListing[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<StorageListing[]>(window.localStorage.getItem(STORAGE_LISTINGS_KEY), []);
}

function setListings(listings: StorageListing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(listings));
  notifyStorageMarketUpdated();
}

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

export function kgToQuintal(kg: number): number {
  return kg / 100;
}

export function quintalToKg(quintal: number): number {
  return quintal * 100;
}

export function getBookingStatus(booking: StorageBooking): "active" | "expired" | "depleted" {
  if (booking.remainingKg <= 0) return "depleted";
  const now = new Date();
  const expiry = new Date(booking.expiresAt);
  return now <= expiry ? "active" : "expired";
}

export function getUserStorageBookings(userId: string): StorageBooking[] {
  return getBookings()
    .filter((b) => b.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getUserStorageListings(userId: string): StorageListing[] {
  return getListings()
    .filter((l) => l.userId === userId)
    .sort((a, b) => +new Date(b.listedDate) - +new Date(a.listedDate));
}

export function createStorageBooking(input: CreateStorageBookingInput): StorageBooking {
  const now = new Date().toISOString();
  const bookedKg = quintalToKg(input.bookedQuintal);

  const booking: StorageBooking = {
    id: generateId("SB"),
    userId: input.userId,
    facilityId: input.facilityId,
    facilityName: input.facilityName,
    facilityLocation: input.facilityLocation,
    facilityState: input.facilityState,
    commodity: input.commodity,
    bookedKg,
    remainingKg: bookedKg,
    soldKg: 0,
    startDate: input.startDate,
    durationMonths: input.durationMonths,
    expiresAt: addMonths(input.startDate, input.durationMonths),
    pricePerQuintal: input.pricePerQuintal,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    createdAt: now,
    updatedAt: now,
  };

  const bookings = getBookings();
  bookings.unshift(booking);
  setBookings(bookings);

  return booking;
}

export function createStorageListing(input: CreateStorageListingInput): { booking: StorageBooking; listing: StorageListing } {
  const bookings = getBookings();
  const bookingIndex = bookings.findIndex((b) => b.id === input.storageBookingId && b.userId === input.userId);

  if (bookingIndex < 0) {
    throw new Error("Storage booking not found.");
  }

  const booking = bookings[bookingIndex];
  const status = getBookingStatus(booking);

  if (status !== "active") {
    throw new Error("This storage booking is not active for new listings.");
  }

  if (input.quantityKg <= 0) {
    throw new Error("Please select a valid quantity.");
  }

  if (input.quantityKg > booking.remainingKg) {
    throw new Error("Cannot list more than remaining storage quantity.");
  }

  const updatedBooking: StorageBooking = {
    ...booking,
    remainingKg: booking.remainingKg - input.quantityKg,
    soldKg: booking.soldKg + input.quantityKg,
    updatedAt: new Date().toISOString(),
  };

  bookings[bookingIndex] = updatedBooking;

  const listings = getListings();
  const listing: StorageListing = {
    id: generateId("SL"),
    userId: input.userId,
    storageBookingId: input.storageBookingId,
    name: booking.commodity,
    category: input.category,
    quantityKg: input.quantityKg,
    availableKg: input.quantityKg,
    pricePerKg: input.pricePerKg,
    location: `${booking.facilityLocation}, ${booking.facilityState}`,
    quality: input.quality,
    status: "active",
    listedDate: new Date().toISOString().split("T")[0],
    image: "📦",
    inquiries: 0,
    description: input.description,
  };

  listings.unshift(listing);
  setBookings(bookings);
  setListings(listings);

  return { booking: updatedBooking, listing };
}

export function cancelStorageListing(listingId: string, userId: string): boolean {
  const listings = getListings();
  const listingIndex = listings.findIndex((l) => l.id === listingId && l.userId === userId);
  if (listingIndex < 0) return false;

  const listing = listings[listingIndex];
  const refundableKg = Math.max(0, listing.availableKg);

  const bookings = getBookings();
  const bookingIndex = bookings.findIndex((b) => b.id === listing.storageBookingId && b.userId === userId);

  if (bookingIndex >= 0 && refundableKg > 0) {
    const booking = bookings[bookingIndex];
    bookings[bookingIndex] = {
      ...booking,
      remainingKg: booking.remainingKg + refundableKg,
      soldKg: Math.max(0, booking.soldKg - refundableKg),
      updatedAt: new Date().toISOString(),
    };
    setBookings(bookings);
  }

  listings.splice(listingIndex, 1);
  setListings(listings);
  return true;
}

export function estimateMonthlyCharge(booking: StorageBooking): number {
  return kgToQuintal(booking.remainingKg) * booking.pricePerQuintal;
}

export function estimateProratedChargeNow(booking: StorageBooking): number {
  const monthlyCharge = estimateMonthlyCharge(booking);
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const totalDays = endOfMonth.getDate();
  const remainingDays = Math.max(1, endOfMonth.getDate() - now.getDate() + 1);
  return (monthlyCharge / totalDays) * remainingDays;
}

export function notifyStorageMarketUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT_KEY));
}

export function onStorageMarketUpdated(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STORAGE_EVENT_KEY, handler);
  return () => window.removeEventListener(STORAGE_EVENT_KEY, handler);
}

export type DemoFacilityType = "cold" | "warehouse" | "silo" | "ca" | "frozen";

export interface DemoStorageFacility {
  id: string;
  name: string;
  type: DemoFacilityType;
  location: string;
  state: string;
  distance: string;
  rating: number;
  reviews: number;
  pricePerQuintal: number;
  capacity: string;
  available: string;
  temperature?: string;
  features: string[];
  image: string;
  verified: boolean;
  tag?: string;
}

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
  "https://images.unsplash.com/photo-1595246135406-803418233494?w=600&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&q=80",
  "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=600&q=80",
  "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80",
  "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80",
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80",
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
  "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600&q=80",
];

const WEST_BENGAL_CITIES = [
  "Kolkata",
  "Howrah",
  "Siliguri",
  "Durgapur",
  "Asansol",
  "Kharagpur",
  "Haldia",
  "Malda",
  "Berhampore",
  "Krishnanagar",
  "Bardhaman",
  "Bankura",
  "Purulia",
  "Jalpaiguri",
  "Cooch Behar",
  "Midnapore",
  "Barasat",
  "Barrackpore",
  "Nabadwip",
  "Darjeeling",
];

const OTHER_STATE_CITIES = [
  { state: "Maharashtra", city: "Nashik" },
  { state: "Maharashtra", city: "Pune" },
  { state: "Gujarat", city: "Ahmedabad" },
  { state: "Gujarat", city: "Rajkot" },
  { state: "Punjab", city: "Ludhiana" },
  { state: "Punjab", city: "Amritsar" },
  { state: "Haryana", city: "Hisar" },
  { state: "UP", city: "Lucknow" },
  { state: "UP", city: "Agra" },
  { state: "Bihar", city: "Patna" },
  { state: "Odisha", city: "Bhubaneswar" },
  { state: "Odisha", city: "Cuttack" },
  { state: "Telangana", city: "Hyderabad" },
  { state: "Andhra Pradesh", city: "Vijayawada" },
  { state: "Karnataka", city: "Bengaluru" },
  { state: "Tamil Nadu", city: "Chennai" },
  { state: "Kerala", city: "Kochi" },
  { state: "Rajasthan", city: "Jaipur" },
  { state: "MP", city: "Bhopal" },
  { state: "Assam", city: "Guwahati" },
];

const NAME_SUFFIXES = [
  "Agri Hub",
  "Cold Store",
  "Storage Point",
  "Warehouse Hub",
  "Crop Vault",
  "Harvest Depot",
  "Farm Store",
  "Kisan Storage",
];

const TAGS = ["Popular", "Top Rated", "High Capacity", "Fast Booking", "Verified", "Premium"];

const FEATURES_BY_TYPE: Record<DemoFacilityType, string[]> = {
  cold: ["24/7 Monitoring", "Humidity Control", "Loading Dock", "Insurance", "CCTV"],
  warehouse: ["Fumigation", "Security", "Weighbridge", "Transport", "CCTV"],
  silo: ["Aeration", "Pest Control", "Rail Connected", "Weighbridge", "Bulk Handling"],
  ca: ["CA Technology", "O2 Control", "Ethylene Control", "Humidity Monitor", "Insurance"],
  frozen: ["Blast Freezing", "Cold Chain", "HACCP", "Export Ready", "IQF Line"],
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function formatMt(value: number): string {
  return `${value.toLocaleString("en-IN")} MT`;
}

function getTemperature(type: DemoFacilityType, rand: () => number): string | undefined {
  if (type === "cold") return `${randInt(1, 4, rand)}°C - ${randInt(7, 10, rand)}°C`;
  if (type === "ca") return `${randInt(1, 3, rand)}°C - ${randInt(5, 7, rand)}°C`;
  if (type === "frozen") return `-${randInt(18, 22, rand)}°C - -${randInt(23, 26, rand)}°C`;
  return undefined;
}

function getPricePerQuintal(type: DemoFacilityType, rand: () => number): number {
  if (type === "cold") return randInt(38, 56, rand);
  if (type === "warehouse") return randInt(20, 30, rand);
  if (type === "silo") return randInt(15, 22, rand);
  if (type === "ca") return randInt(56, 68, rand);
  return randInt(68, 82, rand);
}

export function generateStorageFacilities(totalCount = 120, westBengalCount = 80, seed = 2026): DemoStorageFacility[] {
  const rand = seededRandom(seed);
  const total = Math.max(1, totalCount);
  const wbCount = Math.min(Math.max(0, westBengalCount), total);
  const facilities: DemoStorageFacility[] = [];
  const weightedTypes: DemoFacilityType[] = ["cold", "warehouse", "cold", "silo", "ca", "warehouse", "frozen"];

  for (let i = 0; i < total; i++) {
    const isWestBengal = i < wbCount;
    const source = isWestBengal
      ? { state: "West Bengal", city: WEST_BENGAL_CITIES[i % WEST_BENGAL_CITIES.length] }
      : OTHER_STATE_CITIES[(i - wbCount) % OTHER_STATE_CITIES.length];

    const type = pick(weightedTypes, rand);
    const capacityNum = randInt(1800, 22000, rand);
    const availableRatio = 0.22 + rand() * 0.6;
    const availableNum = Math.max(300, Math.floor(capacityNum * availableRatio));
    const featurePool = FEATURES_BY_TYPE[type];

    facilities.push({
      id: `F-${i + 1}`,
      name: `${source.city} ${pick(NAME_SUFFIXES, rand)}`,
      type,
      location: source.city,
      state: source.state,
      distance: `${randInt(3, 25, rand)} km`,
      rating: Number((4 + rand() * 0.9).toFixed(1)),
      reviews: randInt(35, 260, rand),
      pricePerQuintal: getPricePerQuintal(type, rand),
      capacity: formatMt(capacityNum),
      available: formatMt(Math.min(availableNum, capacityNum)),
      temperature: getTemperature(type, rand),
      features: [featurePool[0], featurePool[1], pick(featurePool, rand), pick(featurePool, rand)],
      image: DEMO_IMAGES[i % DEMO_IMAGES.length],
      verified: rand() > 0.14,
      tag: rand() > 0.68 ? pick(TAGS, rand) : undefined,
    });
  }

  return facilities;
}
