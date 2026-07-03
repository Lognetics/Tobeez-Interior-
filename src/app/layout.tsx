import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AIAssistant } from "@/components/ai/ai-assistant";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TOBEEZ INTERIOR, Intelligent Interior Planning Powered by AI",
    template: "%s · TOBEEZ INTERIOR",
  },
  description:
    "Estimate the cost of furnishing any property with AI, book expert consultations, source products, and manage projects, all in one intelligent platform.",
  keywords: [
    "interior design",
    "AI cost estimator",
    "furnishing estimate",
    "interior consultation",
    "TOBEEZ",
  ],
  metadataBase: new URL("https://tobeez.example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <AIAssistant />
        </Providers>
      </body>
    </html>
  );
}
