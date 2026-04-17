export type EventCategory = string;

export type TicketTier = {
  id: string;
  name: string;
  price: number;
  description?: string;
  benefits?: string[];
  available: number;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  city?: string;
  description: string;
  image?: string | null;
  category: EventCategory;
  status?: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  ticketTiers: TicketTier[];
};

export type BookingTicketTier = {
  tierId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "FAILED" | "CANCELLED" | "EXPIRED";

export type Booking = {
  id: string;
  bookingReference: string;
  eventId: string;
  eventTitle: string;
  eventStartDateTime?: string;
  userId?: string;
  ticketTiers: BookingTicketTier[];
  total: number;
  status: BookingStatus;
  bookingDate: string;
  transactionReference?: string;
  paymentStatus?: string;
};

export type UserProfile = {
  email: string;
  firstName: string;
  lastName: string;
  resourceUrl: string | null;
};
