import type { Metadata } from "next";
import { EstimatorResults } from "@/components/estimator/results";

export const metadata: Metadata = {
  title: "Your AI Estimate",
};

export default function ResultsPage() {
  return <EstimatorResults />;
}
