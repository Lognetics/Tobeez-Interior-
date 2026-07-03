import type { Metadata } from "next";
import { EstimatorWizard } from "@/components/estimator/wizard";

export const metadata: Metadata = {
  title: "AI Cost Estimator",
  description: "Estimate the cost of furnishing your property in minutes with AI.",
};

export default function EstimatorPage() {
  return <EstimatorWizard />;
}
