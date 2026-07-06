import type { Metadata } from "next";
import { DesignStudio } from "@/components/studio/studio";

export const metadata: Metadata = {
  title: "AI Design Studio",
  description: "Describe a space and let AI design, render and cost it, then save results to your projects.",
};

export default function StudioPage() {
  return <DesignStudio />;
}
