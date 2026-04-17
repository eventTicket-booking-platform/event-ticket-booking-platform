import type { BookingStatus } from "@/lib/types";

export type StandardApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type KeycloakTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  "not-before-policy"?: number;
  session_state?: string;
  scope?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contact?: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
  type: "SIGNUP" | "PASSWORD";
};

export type ForgotPasswordPayload = {
  email: string;
};

export type VerifyResetPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = {
  email: string;
  password: string;
  code: string;
};

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
};

export type BookingPayload = {
  eventId: number;
  ticketSelections: Array<{
    ticketTypeId: number;
    quantity: number;
  }>;
  paymentMethod: "CARD" | "WALLET" | "BANK_TRANSFER" | "CASH" | "SIMULATED_FAIL";
};

export type ApiErrorPayload = {
  message: string;
  code?: string | number;
  errors?: Record<string, string[]>;
};

export type UserProfileResponse = {
  email: string;
  firstName: string;
  lastName: string;
  resourceUrl: string | null;
};

export type AuthResponse = StandardApiResponse<KeycloakTokenResponse>;
export type AuthMessageResponse = StandardApiResponse<boolean | null>;
export type UserProfileApiResponse = StandardApiResponse<UserProfileResponse>;

export type CategoryDto = {
  categoryId: number;
  name: string;
  description: string;
  active: boolean;
};

export type EventSummaryDto = {
  eventId: number;
  title: string;
  categoryName: string;
  city: string;
  bannerUrl: string | null;
  startDateTime: string;
  endDateTime: string;
};

export type TicketTypeDto = {
  ticketTypeId: number;
  name: string;
  price: number;
  totalQuantity: number;
};

export type VenueDto = {
  venueId: number;
  name: string;
  city: string;
  address: string;
};

export type EventDetailDto = {
  eventId: number;
  title: string;
  description: string;
  category: CategoryDto;
  venue: VenueDto;
  bannerUrl: string | null;
  startDateTime: string;
  endDateTime: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  ticketTypes: TicketTypeDto[];
};

export type EventsResponse = {
  dataList: EventSummaryDto[];
  dataCount: number;
};

export type EventResponse = EventDetailDto;
export type CategoriesResponse = CategoryDto[];

export type BookingItemDto = {
  ticketTypeId: number;
  ticketTypeName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type PaymentDto = {
  method: "CARD" | "WALLET" | "BANK_TRANSFER" | "CASH" | "SIMULATED_FAIL";
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  transactionReference: string;
  paidAt: string | null;
};

export type BookingResponse = {
  bookingId: number;
  bookingReference: string;
  userId?: string;
  eventId: number;
  eventTitle: string;
  eventBannerResourceUrl?: string | null;
  eventStartDateTime?: string;
  status: BookingStatus;
  totalAmount: number;
  bookingDate: string;
  items?: BookingItemDto[];
  payment?: PaymentDto | null;
};

export type BookingsResponse = {
  dataList: BookingResponse[];
  dataCount: number;
};
