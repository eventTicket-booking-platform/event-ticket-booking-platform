export type EventCategory =
  | "music"
  | "food"
  | "arts"
  | "sports"
  | "tech"
  | "networking";

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  available: number;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: EventCategory;
  rating: number;
  reviews: number;
  attendees: number;
  featured: boolean;
  trendingScore: number;
  highlights: string[];
  reviewQuotes: Array<{
    id: string;
    name: string;
    rating: number;
    comment: string;
  }>;
  ticketTiers: TicketTier[];
};

export type Booking = {
  id: string;
  eventId: string;
  userId: string;
  ticketTiers: {
    tierId: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  attendeeInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  total: number;
  status: "confirmed" | "cancelled" | "pending" | "completed";
  bookingDate: string;
};

export const categoryMeta: Record<
  EventCategory,
  {
    label: string;
    description: string;
    accent: string;
  }
> = {
  music: {
    label: "Music & Concerts",
    description: "Arena shows, indie sessions, and curated live sets.",
    accent: "from-neutral-200 via-white to-neutral-500/60",
  },
  food: {
    label: "Food & Dining",
    description: "Chef tables, tasting nights, and culinary festivals.",
    accent: "from-stone-200 via-zinc-100 to-amber-200/70",
  },
  arts: {
    label: "Arts & Theater",
    description: "Stage productions, galleries, and immersive showcases.",
    accent: "from-slate-200 via-zinc-100 to-rose-200/70",
  },
  sports: {
    label: "Sports & Fitness",
    description: "Matches, races, training clinics, and active experiences.",
    accent: "from-lime-200 via-neutral-100 to-emerald-200/70",
  },
  tech: {
    label: "Technology & Innovation",
    description: "Product launches, AI forums, and engineering summits.",
    accent: "from-cyan-200 via-slate-100 to-blue-200/70",
  },
  networking: {
    label: "Networking & Business",
    description: "Founder dinners, industry mixers, and executive roundtables.",
    accent: "from-violet-200 via-zinc-100 to-fuchsia-200/70",
  },
};

export const events: Event[] = [
  {
    id: "midnight-city-sessions",
    title: "Midnight City Sessions",
    date: "June 21, 2026",
    time: "8:30 PM",
    location: "Pier 57, New York",
    description:
      "An atmospheric waterfront concert blending electronic artists, cinematic visuals, and premium lounge hospitality for one long-form summer night.",
    image: "music",
    category: "music",
    rating: 4.9,
    reviews: 312,
    attendees: 4200,
    featured: true,
    trendingScore: 99,
    highlights: [
      "Four headline sets with synchronized projection design",
      "Quiet lounge zones and chef-led late-night dining",
      "Fast-lane venue entry with digital ticket scan",
    ],
    reviewQuotes: [
      {
        id: "r1",
        name: "Jordan P.",
        rating: 5,
        comment: "Production quality was absurdly good and entry took less than two minutes.",
      },
      {
        id: "r2",
        name: "Ava N.",
        rating: 5,
        comment: "The VIP mezzanine was worth it for the sightlines alone.",
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General",
        price: 79,
        description: "Standard standing access with main stage view.",
        benefits: ["Main floor access", "Digital ticket", "Express scan entry"],
        available: 128,
      },
      {
        id: "vip",
        name: "VIP",
        price: 169,
        description: "Premium balcony access with private bar lanes.",
        benefits: ["Balcony access", "Priority check-in", "Welcome drink"],
        available: 34,
      },
      {
        id: "student",
        name: "Student",
        price: 49,
        description: "Discounted access for valid student ID holders.",
        benefits: ["Main floor access", "Discounted entry", "Digital ticket"],
        available: 75,
      },
    ],
  },
  {
    id: "future-stack-summit",
    title: "FutureStack Summit 2026",
    date: "July 12, 2026",
    time: "9:00 AM",
    location: "Moscone Center, San Francisco",
    description:
      "A product and engineering summit focused on applied AI, cloud-native platforms, and the next wave of developer tooling.",
    image: "tech",
    category: "tech",
    rating: 4.8,
    reviews: 221,
    attendees: 3100,
    featured: true,
    trendingScore: 97,
    highlights: [
      "Executive keynotes and builder-led technical tracks",
      "Hands-on labs with architecture office hours",
      "Investor and hiring lounge access",
    ],
    reviewQuotes: [
      {
        id: "r3",
        name: "Mina L.",
        rating: 5,
        comment: "The schedule felt sharp and the breakout sessions were immediately practical.",
      },
      {
        id: "r4",
        name: "Reese D.",
        rating: 4,
        comment: "Great speaker roster and one of the cleaner event apps I have used.",
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General",
        price: 129,
        description: "Full summit access across all open tracks.",
        benefits: ["All talks", "Expo hall", "Session recordings"],
        available: 210,
      },
      {
        id: "vip",
        name: "VIP",
        price: 299,
        description: "Priority seating and founders lounge access.",
        benefits: ["Priority seating", "Lounge access", "Speaker reception"],
        available: 48,
      },
      {
        id: "student",
        name: "Student",
        price: 69,
        description: "Reduced-price pass for university attendees.",
        benefits: ["Talk access", "Career zone", "Session recordings"],
        available: 120,
      },
    ],
  },
  {
    id: "plate-and-pour-festival",
    title: "Plate & Pour Festival",
    date: "August 3, 2026",
    time: "2:00 PM",
    location: "Navy Yard, Washington DC",
    description:
      "A modern food festival with tasting stations, regional chefs, craft beverage pairings, and live culinary demos.",
    image: "food",
    category: "food",
    rating: 4.7,
    reviews: 184,
    attendees: 1850,
    featured: true,
    trendingScore: 92,
    highlights: [
      "Forty curated tasting partners",
      "Reserved seating for chef theater sessions",
      "Premium beverage pairing upgrade",
    ],
    reviewQuotes: [
      {
        id: "r5",
        name: "Theo C.",
        rating: 5,
        comment: "Worth it for the tasting variety and how easy the booking process was.",
      },
      {
        id: "r6",
        name: "Nia R.",
        rating: 4,
        comment: "Well organized, plenty of stations, and no long waits.",
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General",
        price: 59,
        description: "Festival admission and tasting access.",
        benefits: ["Festival entry", "Tasting card", "Chef demo access"],
        available: 160,
      },
      {
        id: "vip",
        name: "VIP",
        price: 119,
        description: "Early entry plus premium beverage pairing.",
        benefits: ["Early entry", "Pairing package", "Reserved lounge"],
        available: 52,
      },
      {
        id: "student",
        name: "Student",
        price: 39,
        description: "Discounted entry with limited tasting card.",
        benefits: ["Festival entry", "Starter tasting card", "Demo access"],
        available: 90,
      },
    ],
  },
  {
    id: "stadium-night-run",
    title: "Stadium Night Run",
    date: "September 18, 2026",
    time: "7:00 PM",
    location: "SoFi Stadium, Los Angeles",
    description:
      "A city-scale night run with pace groups, after-party performances, and recovery zones built into the venue campus.",
    image: "sports",
    category: "sports",
    rating: 4.6,
    reviews: 146,
    attendees: 6100,
    featured: true,
    trendingScore: 91,
    highlights: [
      "5K and 10K staggered starts",
      "Recovery courtyard with brand activations",
      "Post-run live DJ set and food village",
    ],
    reviewQuotes: [
      {
        id: "r7",
        name: "Cam B.",
        rating: 5,
        comment: "The course production and finish area felt premium the whole way through.",
      },
      {
        id: "r8",
        name: "Lena F.",
        rating: 4,
        comment: "Very polished for a large crowd event and the finish logistics were smooth.",
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General",
        price: 45,
        description: "Standard race entry with runner pack.",
        benefits: ["Race entry", "Runner bib", "Finish medal"],
        available: 380,
      },
      {
        id: "vip",
        name: "VIP",
        price: 95,
        description: "Priority lanes and premium recovery lounge.",
        benefits: ["Priority check-in", "Lounge access", "Merch bundle"],
        available: 68,
      },
      {
        id: "student",
        name: "Student",
        price: 30,
        description: "Discounted race access for students.",
        benefits: ["Race entry", "Runner bib", "Finish medal"],
        available: 140,
      },
    ],
  },
  {
    id: "gallery-after-dark",
    title: "Gallery After Dark",
    date: "May 9, 2026",
    time: "6:30 PM",
    location: "The Broad, Los Angeles",
    description:
      "An evening art experience with private gallery access, artist talks, and ambient sound design woven through the exhibit route.",
    image: "arts",
    category: "arts",
    rating: 4.8,
    reviews: 109,
    attendees: 960,
    featured: false,
    trendingScore: 88,
    highlights: [
      "Curator-led intimate walkthroughs",
      "Limited-capacity timed admission",
      "Signature cocktails in the atrium",
    ],
    reviewQuotes: [
      {
        id: "r9",
        name: "Sofia M.",
        rating: 5,
        comment: "The pacing was excellent and it never felt overcrowded.",
      },
      {
        id: "r10",
        name: "Eli W.",
        rating: 4,
        comment: "Strong production and a genuinely memorable venue flow.",
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General",
        price: 55,
        description: "Timed gallery access with talk admission.",
        benefits: ["Gallery entry", "Artist talk", "Digital program"],
        available: 92,
      },
      {
        id: "vip",
        name: "VIP",
        price: 110,
        description: "Priority admission and rooftop reception.",
        benefits: ["Priority entry", "Reception access", "Signed print"],
        available: 18,
      },
      {
        id: "student",
        name: "Student",
        price: 28,
        description: "Reduced admission for students.",
        benefits: ["Gallery entry", "Artist talk", "Digital program"],
        available: 46,
      },
    ],
  },
  {
    id: "founder-table-west",
    title: "Founder Table West",
    date: "October 7, 2026",
    time: "5:30 PM",
    location: "Mission Bay, San Francisco",
    description:
      "A curated operator and founder gathering with short-form talks, hosted introductions, and structured networking over dinner.",
    image: "networking",
    category: "networking",
    rating: 4.9,
    reviews: 87,
    attendees: 280,
    featured: false,
    trendingScore: 90,
    highlights: [
      "Host-led intros to matched attendees",
      "Smaller room format for higher signal conversations",
      "Operator playbook takeaways after the event",
    ],
    reviewQuotes: [
      {
        id: "r11",
        name: "Harper T.",
        rating: 5,
        comment: "One of the few networking events that actually delivers relevant conversations.",
      },
      {
        id: "r12",
        name: "Noah K.",
        rating: 5,
        comment: "Tight guest list, strong moderation, and no wasted time.",
      },
    ],
    ticketTiers: [
      {
        id: "general",
        name: "General",
        price: 85,
        description: "Dinner event access and curated intros.",
        benefits: ["Dinner included", "Hosted intros", "Attendee list"],
        available: 60,
      },
      {
        id: "vip",
        name: "VIP",
        price: 175,
        description: "Front-row seating and speaker roundtable.",
        benefits: ["Speaker roundtable", "Priority seating", "Private reception"],
        available: 15,
      },
      {
        id: "student",
        name: "Student",
        price: 45,
        description: "Early-career and student admission.",
        benefits: ["Dinner included", "Hosted intros", "Attendee list"],
        available: 20,
      },
    ],
  },
];

export const featuredEvents = events.filter((event) => event.featured).slice(0, 4);

export const categories = Object.entries(categoryMeta).map(([key, meta]) => {
  const category = key as EventCategory;
  const categoryEvents = events.filter((event) => event.category === category);
  return {
    id: category,
    ...meta,
    count: categoryEvents.length,
    featuredEvents: categoryEvents.slice(0, 2),
  };
});

export const faqItems = [
  {
    question: "Can I cancel a booking after payment?",
    answer:
      "Yes. You can cancel eligible bookings from the dashboard. Refund logic is simulated for this frontend demo, but the UX flow is ready for backend rules.",
  },
  {
    question: "How are tickets delivered?",
    answer:
      "Bookings generate a confirmation step immediately and appear in My Bookings with download actions for ticket retrieval.",
  },
  {
    question: "Do you support multiple ticket tiers in one order?",
    answer:
      "Yes. The checkout flow supports independent quantities for General, VIP, and Student tiers and updates the order summary live.",
  },
  {
    question: "Can I book as a guest?",
    answer:
      "The current experience is designed around signed-in users, but the attendee form is structured so guest checkout can be added later.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "This project simulates card payments with formatted card inputs and processing states. Real gateways can be integrated later.",
  },
  {
    question: "Is the platform mobile friendly?",
    answer:
      "Yes. Every primary route uses mobile-first layouts and keeps purchase actions accessible on smaller screens.",
  },
];

export const dashboardUser = {
  id: "user-1",
  name: "Samantha Lee",
  email: "samantha@eventhub.app",
  joined: "February 2024",
  totalBookings: 7,
  totalSpent: 1284,
};

export const bookings: Booking[] = [
  {
    id: "EVH-49281",
    eventId: "future-stack-summit",
    userId: "user-1",
    ticketTiers: [{ tierId: "vip", name: "VIP", quantity: 2, price: 299, subtotal: 598 }],
    attendeeInfo: {
      firstName: "Samantha",
      lastName: "Lee",
      email: "samantha@eventhub.app",
      phone: "+1 (415) 555-0118",
    },
    total: 705,
    status: "confirmed",
    bookingDate: "April 2, 2026",
  },
  {
    id: "EVH-38120",
    eventId: "plate-and-pour-festival",
    userId: "user-1",
    ticketTiers: [{ tierId: "general", name: "General", quantity: 3, price: 59, subtotal: 177 }],
    attendeeInfo: {
      firstName: "Samantha",
      lastName: "Lee",
      email: "samantha@eventhub.app",
      phone: "+1 (415) 555-0118",
    },
    total: 210,
    status: "confirmed",
    bookingDate: "March 10, 2026",
  },
  {
    id: "EVH-27410",
    eventId: "gallery-after-dark",
    userId: "user-1",
    ticketTiers: [{ tierId: "general", name: "General", quantity: 2, price: 55, subtotal: 110 }],
    attendeeInfo: {
      firstName: "Samantha",
      lastName: "Lee",
      email: "samantha@eventhub.app",
      phone: "+1 (415) 555-0118",
    },
    total: 129,
    status: "completed",
    bookingDate: "January 18, 2026",
  },
];

export function getEventById(id: string) {
  return events.find((event) => event.id === id);
}

export function getRelatedEvents(id: string, category: EventCategory) {
  return events.filter((event) => event.id !== id && event.category === category).slice(0, 3);
}
