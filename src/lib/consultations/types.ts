export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type ConsultationBooking = {
  id: string;
  clientUserId: string;
  consultantId: string;
  consultantName: string;
  clientName: string;
  clientEmail: string;
  type: string;
  mode: "virtual" | "phone" | "physical";
  dateIso: string;
  dateLabel: string;
  time: string;
  amount: number;
  paystackRef: string;
  status: BookingStatus;
  notes: string;
  createdAt: number;
};

export type AvailabilityEntry = {
  dateIso?: string;
  weekday?: number;
  slots: string[];
};

export type ConsultantIdentity = {
  consultantId: string;
  consultantName: string;
};

export const CONSULTATION_TIMES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"] as const;
