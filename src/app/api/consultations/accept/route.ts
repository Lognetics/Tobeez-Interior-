import { handleConsultationTransition } from "@/lib/consultations/transition";

export async function POST(request: Request) {
  return handleConsultationTransition(request, "accept");
}
