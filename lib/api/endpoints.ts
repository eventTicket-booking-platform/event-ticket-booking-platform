import { apiRequest } from "@/lib/api/fetcher";
import { toQueryString } from "@/lib/api/query";
import type {
  AuthMessageResponse,
  AuthResponse,
  BookingPayload,
  BookingResponse,
  BookingsResponse,
  CategoriesResponse,
  EventResponse,
  EventsResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResendOtpPayload,
  UpdateProfilePayload,
  UserProfileApiResponse,
  VerifyEmailPayload,
  VerifyResetPayload,
} from "@/lib/api/types";

export const api = {
  auth: {
    login(payload: LoginPayload) {
      return apiRequest<AuthResponse>("/user-service/api/v1/users/visitors/login", {
        method: "POST",
        body: payload,
      });
    },
    register(payload: RegisterPayload) {
      return apiRequest<AuthMessageResponse>("/user-service/api/v1/users/visitors/signup", {
        method: "POST",
        body: payload,
      });
    },
    verifyEmail(payload: VerifyEmailPayload) {
      return apiRequest<AuthMessageResponse>(
        `/user-service/api/v1/users/visitors/verify-email${toQueryString({ email: payload.email, otp: payload.otp })}`,
        {
          method: "POST",
        },
      );
    },
    resendOtp(payload: ResendOtpPayload) {
      return apiRequest<AuthMessageResponse>(
        `/user-service/api/v1/users/visitors/resend${toQueryString({ email: payload.email, type: payload.type })}`,
        {
          method: "POST",
        },
      );
    },
    requestPasswordReset(payload: ForgotPasswordPayload) {
      return apiRequest<AuthMessageResponse>(
        `/user-service/api/v1/users/visitors/forget-password-request-code${toQueryString({ email: payload.email })}`,
        {
          method: "POST",
        },
      );
    },
    verifyPasswordReset(payload: VerifyResetPayload) {
      return apiRequest<AuthMessageResponse>(
        `/user-service/api/v1/users/visitors/verify-reset${toQueryString({ email: payload.email, otp: payload.otp })}`,
        {
          method: "POST",
        },
      );
    },
    resetPassword(payload: ResetPasswordPayload) {
      return apiRequest<AuthMessageResponse>("/user-service/api/v1/users/visitors/reset-password", {
        method: "POST",
        body: payload,
      });
    },
    me(token: string) {
      return apiRequest<UserProfileApiResponse>("/user-service/api/v1/users/get-user-details", {
        method: "GET",
        token,
        cache: "no-store",
      });
    },
    updateProfile(payload: UpdateProfilePayload, token: string) {
      return apiRequest<AuthMessageResponse>("/user-service/api/v1/users/update-user-details", {
        method: "PUT",
        body: payload,
        token,
      });
    },
    uploadAvatar(file: FormData, token: string) {
      return apiRequest<AuthMessageResponse>("/user-service/api/v1/avatars/user/manage-avatar", {
        method: "POST",
        body: file,
        token,
      });
    },
  },
  events: {
    list(params: {
      search?: string;
      category?: number;
      city?: string;
      page?: number;
      size?: number;
    } = {}) {
      return apiRequest<EventsResponse>(`/event-service/api/v1/events${toQueryString(params)}`, {
        method: "GET",
        cache: "no-store",
      });
    },
    byId(id: number | string) {
      return apiRequest<EventResponse>(`/event-service/api/v1/events/${id}`, {
        method: "GET",
        cache: "no-store",
      });
    },
    categories() {
      return apiRequest<CategoriesResponse>("/event-service/api/v1/events/categories", {
        method: "GET",
        cache: "no-store",
      });
    },
  },
  bookings: {
    create(payload: BookingPayload, token: string) {
      return apiRequest<BookingResponse>("/booking-service/api/v1/bookings", {
        method: "POST",
        body: payload,
        token,
      });
    },
    mine(token: string, params: { page?: number; size?: number } = {}) {
      return apiRequest<BookingsResponse>(`/booking-service/api/v1/bookings/my${toQueryString(params)}`, {
        method: "GET",
        token,
        cache: "no-store",
      });
    },
    byId(id: number | string, token: string) {
      return apiRequest<BookingResponse>(`/booking-service/api/v1/bookings/${id}`, {
        method: "GET",
        token,
        cache: "no-store",
      });
    },
    cancel(id: number | string, token: string) {
      return apiRequest<{ message: string }>(`/booking-service/api/v1/bookings/${id}/cancel`, {
        method: "PATCH",
        token,
      });
    },
  },
};
