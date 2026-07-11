export type EventCategory = "concert" | "sports";

export type PlatformName = "SeatGeek" | "Ticketmaster" | "Vivid Seats" | "StubHub";

export interface PlatformPrice {
  platform: PlatformName;
  price: number; // price on this platform in USD
}

export interface SeatEvent {
  id: string;
  name: string;
  category: EventCategory;
  date: string; // ISO date, e.g. "2026-08-14"
  time: string; // e.g. "7:30 PM"
  venue: string;
  city: string; // e.g. "East Rutherford, NJ"
  fromPrice: number; // cheapest available price in USD (matches the lowest platform price)
  platforms: PlatformPrice[]; // per-platform prices — swap for real API data later
}

// Hardcoded mock data — swap this out for real API results later.
export const mockEvents: SeatEvent[] = [
  {
    id: "taylor-swift-metlife",
    name: "Taylor Swift — The Eras Tour",
    category: "concert",
    date: "2026-08-14",
    time: "7:30 PM",
    venue: "MetLife Stadium",
    city: "East Rutherford, NJ",
    fromPrice: 285,
    platforms: [
      { platform: "SeatGeek", price: 285 },
      { platform: "Ticketmaster", price: 319 },
      { platform: "Vivid Seats", price: 298 },
      { platform: "StubHub", price: 305 },
    ],
  },
  {
    id: "knicks-vs-celtics-msg",
    name: "Knicks vs Celtics",
    category: "sports",
    date: "2026-08-16",
    time: "8:00 PM",
    venue: "Madison Square Garden",
    city: "New York, NY",
    fromPrice: 145,
    platforms: [
      { platform: "SeatGeek", price: 162 },
      { platform: "Ticketmaster", price: 145 },
      { platform: "Vivid Seats", price: 158 },
      { platform: "StubHub", price: 151 },
    ],
  },
  {
    id: "zach-bryan-fenway",
    name: "Zach Bryan",
    category: "concert",
    date: "2026-08-19",
    time: "7:00 PM",
    venue: "Fenway Park",
    city: "Boston, MA",
    fromPrice: 96,
    platforms: [
      { platform: "SeatGeek", price: 104 },
      { platform: "Ticketmaster", price: 112 },
      { platform: "Vivid Seats", price: 96 },
      { platform: "StubHub", price: 99 },
    ],
  },
  {
    id: "lakers-vs-warriors-crypto",
    name: "Lakers vs Warriors",
    category: "sports",
    date: "2026-08-21",
    time: "7:30 PM",
    venue: "Crypto.com Arena",
    city: "Los Angeles, CA",
    fromPrice: 175,
    platforms: [
      { platform: "SeatGeek", price: 189 },
      { platform: "Ticketmaster", price: 199 },
      { platform: "Vivid Seats", price: 182 },
      { platform: "StubHub", price: 175 },
    ],
  },
  {
    id: "billie-eilish-united-center",
    name: "Billie Eilish",
    category: "concert",
    date: "2026-08-23",
    time: "8:00 PM",
    venue: "United Center",
    city: "Chicago, IL",
    fromPrice: 112,
    platforms: [
      { platform: "SeatGeek", price: 112 },
      { platform: "Ticketmaster", price: 128 },
      { platform: "Vivid Seats", price: 119 },
      { platform: "StubHub", price: 122 },
    ],
  },
  {
    id: "cowboys-vs-eagles-att",
    name: "Cowboys vs Eagles",
    category: "sports",
    date: "2026-09-08",
    time: "4:25 PM",
    venue: "AT&T Stadium",
    city: "Arlington, TX",
    fromPrice: 210,
    platforms: [
      { platform: "SeatGeek", price: 234 },
      { platform: "Ticketmaster", price: 210 },
      { platform: "Vivid Seats", price: 225 },
      { platform: "StubHub", price: 219 },
    ],
  },
  {
    id: "morgan-wallen-nissan",
    name: "Morgan Wallen",
    category: "concert",
    date: "2026-09-12",
    time: "7:00 PM",
    venue: "Nissan Stadium",
    city: "Nashville, TN",
    fromPrice: 89,
    platforms: [
      { platform: "SeatGeek", price: 96 },
      { platform: "Ticketmaster", price: 103 },
      { platform: "Vivid Seats", price: 92 },
      { platform: "StubHub", price: 89 },
    ],
  },
  {
    id: "yankees-vs-red-sox-yankee",
    name: "Yankees vs Red Sox",
    category: "sports",
    date: "2026-09-15",
    time: "1:05 PM",
    venue: "Yankee Stadium",
    city: "Bronx, NY",
    fromPrice: 62,
    platforms: [
      { platform: "SeatGeek", price: 62 },
      { platform: "Ticketmaster", price: 78 },
      { platform: "Vivid Seats", price: 71 },
      { platform: "StubHub", price: 69 },
    ],
  },
  {
    id: "sabrina-carpenter-kia",
    name: "Sabrina Carpenter",
    category: "concert",
    date: "2026-09-20",
    time: "7:30 PM",
    venue: "Kia Forum",
    city: "Inglewood, CA",
    fromPrice: 128,
    platforms: [
      { platform: "SeatGeek", price: 141 },
      { platform: "Ticketmaster", price: 152 },
      { platform: "Vivid Seats", price: 128 },
      { platform: "StubHub", price: 135 },
    ],
  },
  {
    id: "heat-vs-bucks-kaseya",
    name: "Heat vs Bucks",
    category: "sports",
    date: "2026-09-27",
    time: "7:00 PM",
    venue: "Kaseya Center",
    city: "Miami, FL",
    fromPrice: 54,
    platforms: [
      { platform: "SeatGeek", price: 61 },
      { platform: "Ticketmaster", price: 54 },
      { platform: "Vivid Seats", price: 59 },
      { platform: "StubHub", price: 57 },
    ],
  },
];

export function getEventById(id: string): SeatEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}
