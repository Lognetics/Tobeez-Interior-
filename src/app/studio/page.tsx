import type { Metadata } from "next";
import { StudioChat } from "@/components/studio/studio-chat";

export const metadata: Metadata = {
  title: "AI Design Studio",
  description: "Chat with a real AI to design spaces, generate images and redesign uploaded rooms.",
};

export default function StudioPage() {
  return <StudioChat />;
}
