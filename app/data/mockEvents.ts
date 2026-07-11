export type EventCategory = "concert" | "sports";

export type PlatformName = "SeatGeek" | "Ticketmaster" | "Vivid Seats" | "StubHub";

export interface PlatformPrice {
  platform: PlatformName;
  price: number; // price on this platform in USD
}

export type Recommendation = "buy" | "wait" | "insufficient";
export type Confidence = "High" | "Medium" | "Low";

export interface PricePoint {
  date: string; // short label, e.g. "Jun 1"
  price: number; // cheapest price on that date in USD
}

export interface Prediction {
  recommendation: Recommendation;
  confidence?: Confidence; // omitted for the "insufficient" state
  reasoning: string;
  priceHistory: PricePoint[]; // cheapest price over recent weeks
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
  prediction: Prediction; // buy/wait/insufficient call — swap for a real prediction engine later
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
    prediction: {
      recommendation: "buy",
      confidence: "High",
      reasoning:
        "Prices have climbed 14% in the past two weeks and typically peak closer to the event date.",
      priceHistory: [
        { date: "May 4", price: 238 },
        { date: "May 11", price: 242 },
        { date: "May 18", price: 249 },
        { date: "May 25", price: 251 },
        { date: "Jun 1", price: 258 },
        { date: "Jun 8", price: 262 },
        { date: "Jun 15", price: 260 },
        { date: "Jun 22", price: 268 },
        { date: "Jun 29", price: 273 },
        { date: "Jul 6", price: 279 },
        { date: "Jul 13", price: 282 },
        { date: "Jul 20", price: 285 },
      ],
    },
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
    prediction: {
      recommendation: "wait",
      confidence: "Medium",
      reasoning:
        "Prices are trending down and similar matchups have dropped 10–15% in the final weeks before tip-off.",
      priceHistory: [
        { date: "May 4", price: 178 },
        { date: "May 11", price: 175 },
        { date: "May 18", price: 172 },
        { date: "May 25", price: 168 },
        { date: "Jun 1", price: 166 },
        { date: "Jun 8", price: 161 },
        { date: "Jun 15", price: 159 },
        { date: "Jun 22", price: 156 },
        { date: "Jun 29", price: 153 },
        { date: "Jul 6", price: 150 },
        { date: "Jul 13", price: 147 },
        { date: "Jul 20", price: 145 },
      ],
    },
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
    prediction: {
      recommendation: "buy",
      confidence: "Medium",
      reasoning:
        "Prices have steadily risen since the on-sale and demand tends to firm up as the show approaches.",
      priceHistory: [
        { date: "May 4", price: 78 },
        { date: "May 11", price: 80 },
        { date: "May 18", price: 79 },
        { date: "May 25", price: 83 },
        { date: "Jun 1", price: 85 },
        { date: "Jun 8", price: 88 },
        { date: "Jun 15", price: 87 },
        { date: "Jun 22", price: 90 },
        { date: "Jun 29", price: 92 },
        { date: "Jul 6", price: 93 },
        { date: "Jul 13", price: 95 },
        { date: "Jul 20", price: 96 },
      ],
    },
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
    prediction: {
      recommendation: "wait",
      confidence: "High",
      reasoning:
        "Inventory is high and prices have fallen every week for over a month, with more room to drop.",
      priceHistory: [
        { date: "May 4", price: 205 },
        { date: "May 11", price: 202 },
        { date: "May 18", price: 198 },
        { date: "May 25", price: 199 },
        { date: "Jun 1", price: 193 },
        { date: "Jun 8", price: 189 },
        { date: "Jun 15", price: 186 },
        { date: "Jun 22", price: 184 },
        { date: "Jun 29", price: 181 },
        { date: "Jul 6", price: 179 },
        { date: "Jul 13", price: 176 },
        { date: "Jul 20", price: 175 },
      ],
    },
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
    prediction: {
      recommendation: "buy",
      confidence: "High",
      reasoning:
        "Prices are up nearly 20% since May and this run of shows has been selling through quickly.",
      priceHistory: [
        { date: "May 4", price: 92 },
        { date: "May 11", price: 94 },
        { date: "May 18", price: 97 },
        { date: "May 25", price: 99 },
        { date: "Jun 1", price: 101 },
        { date: "Jun 8", price: 100 },
        { date: "Jun 15", price: 104 },
        { date: "Jun 22", price: 106 },
        { date: "Jun 29", price: 108 },
        { date: "Jul 6", price: 109 },
        { date: "Jul 13", price: 111 },
        { date: "Jul 20", price: 112 },
      ],
    },
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
    prediction: {
      recommendation: "wait",
      confidence: "Low",
      reasoning:
        "Prices have drifted slightly lower and rivalry games often soften a bit before game week.",
      priceHistory: [
        { date: "May 4", price: 228 },
        { date: "May 11", price: 226 },
        { date: "May 18", price: 227 },
        { date: "May 25", price: 223 },
        { date: "Jun 1", price: 222 },
        { date: "Jun 8", price: 220 },
        { date: "Jun 15", price: 219 },
        { date: "Jun 22", price: 217 },
        { date: "Jun 29", price: 216 },
        { date: "Jul 6", price: 213 },
        { date: "Jul 13", price: 212 },
        { date: "Jul 20", price: 210 },
      ],
    },
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
    prediction: {
      recommendation: "insufficient",
      reasoning:
        "This event was listed recently, so there isn't enough price history yet to make a confident call.",
      priceHistory: [
        { date: "Jul 6", price: 92 },
        { date: "Jul 13", price: 90 },
        { date: "Jul 20", price: 89 },
      ],
    },
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
    prediction: {
      recommendation: "wait",
      confidence: "Medium",
      reasoning:
        "Weekday afternoon games usually see prices ease, and this one has trended down for weeks.",
      priceHistory: [
        { date: "May 4", price: 82 },
        { date: "May 11", price: 80 },
        { date: "May 18", price: 78 },
        { date: "May 25", price: 77 },
        { date: "Jun 1", price: 74 },
        { date: "Jun 8", price: 72 },
        { date: "Jun 15", price: 71 },
        { date: "Jun 22", price: 69 },
        { date: "Jun 29", price: 67 },
        { date: "Jul 6", price: 65 },
        { date: "Jul 13", price: 63 },
        { date: "Jul 20", price: 62 },
      ],
    },
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
    prediction: {
      recommendation: "buy",
      confidence: "High",
      reasoning:
        "Prices have risen steadily for two months and demand for this tour has been consistently strong.",
      priceHistory: [
        { date: "May 4", price: 104 },
        { date: "May 11", price: 107 },
        { date: "May 18", price: 110 },
        { date: "May 25", price: 112 },
        { date: "Jun 1", price: 115 },
        { date: "Jun 8", price: 117 },
        { date: "Jun 15", price: 116 },
        { date: "Jun 22", price: 120 },
        { date: "Jun 29", price: 123 },
        { date: "Jul 6", price: 125 },
        { date: "Jul 13", price: 127 },
        { date: "Jul 20", price: 128 },
      ],
    },
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
    prediction: {
      recommendation: "buy",
      confidence: "Low",
      reasoning:
        "Prices have edged up over the last month, though the trend is mild so the upside is limited.",
      priceHistory: [
        { date: "May 4", price: 44 },
        { date: "May 11", price: 45 },
        { date: "May 18", price: 47 },
        { date: "May 25", price: 46 },
        { date: "Jun 1", price: 49 },
        { date: "Jun 8", price: 50 },
        { date: "Jun 15", price: 51 },
        { date: "Jun 22", price: 50 },
        { date: "Jun 29", price: 52 },
        { date: "Jul 6", price: 53 },
        { date: "Jul 13", price: 54 },
        { date: "Jul 20", price: 54 },
      ],
    },
  },
];

export function getEventById(id: string): SeatEvent | undefined {
  return mockEvents.find((event) => event.id === id);
}
