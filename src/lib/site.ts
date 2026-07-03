/** Global site configuration: brand, navigation, contact, socials. */
export const site = {
  name: "TOBEEZ INTERIOR",
  shortName: "TOBEEZ",
  tagline: "Intelligent Interior Planning Powered by AI",
  description:
    "Estimate the cost of furnishing any property with AI, book expert consultations, source products, and manage projects.",
  email: "hello@tobeez.interior",
  phone: "+234 800 000 0000",
  address: "Lekki Phase 1, Lagos, Nigeria",
  socials: {
    instagram: "#",
    x: "#",
    linkedin: "#",
    pinterest: "#",
  },
};

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "AI Estimator", href: "/estimator" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Consultation", href: "/consultation" },
  { label: "About", href: "/about" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Platform",
    items: [
      { label: "AI Cost Estimator", href: "/estimator" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Book Consultation", href: "/consultation" },
      { label: "Portfolio", href: "/about#portfolio" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Our Process", href: "/about#process" },
      { label: "Careers", href: "/about#careers" },
      { label: "Contact", href: "/about#contact" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/signup" },
      { label: "Client Dashboard", href: "/dashboard" },
      { label: "Designer Portal", href: "/designer" },
    ],
  },
];
