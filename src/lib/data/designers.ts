/** Consultants (interior experts) for the premium booking platform. */
export type Designer = {
  id: string;
  name: string;
  title: string;
  initials: string;
  rating: number;
  projects: number;
  specialties: string[];
  rate: number;
  gradient: string;
  photo?: string;
  // Enriched profile fields
  bio: string;
  experienceYears: number;
  languages: string[];
  certifications: string[];
  responseTime: string;
  successRate: number;
  completedConsultations: number;
  online: boolean;
};

export const DESIGNERS: Designer[] = [
  {
    id: "d1", name: "Victory Asaboro", title: "Lead Designer, TOBEEZ Interiors", initials: "VA",
    rating: 4.9, projects: 20, specialties: ["Modern Luxury", "Minimalism", "3D Visualisation"], rate: 100000,
    gradient: "from-amber-300 to-orange-400", // photo pending — no confirmed image for Victory yet
    bio: "Lead Designer of TOBEEZ Interiors with qualifications in Interior Design, Project and Business Management, and a member of the Interior Designers Association of Nigeria (IDAN). Creates refined, contemporary spaces shaped by modern luxury and thoughtful minimalism — with 3D design and visualisation expertise that lets you experience your space before the transformation begins.",
    experienceYears: 4, languages: ["English"], certifications: ["Interior Design", "Project & Business Management", "IDAN Member"],
    responseTime: "under 4 hours", successRate: 98, completedConsultations: 20, online: true,
  },
  {
    id: "d2", name: "Joy", title: "Interior Designer", initials: "J",
    rating: 4.9, projects: 15, specialties: ["Design Reviews", "Space Planning"], rate: 100000,
    gradient: "from-emerald-300 to-teal-400", photo: "/coporate/joy.png",
    bio: "Interior Designer with over six years of experience and a Master's degree in Interior Design. Helps homeowners, business owners and developers make smart design decisions through professional design reviews and space-planning consultations — clear, expert guidance before you invest your time and money.",
    experienceYears: 6, languages: ["English"], certifications: ["MSc Interior Design"],
    responseTime: "under 6 hours", successRate: 97, completedConsultations: 15, online: true,
  },
];

export const CONSULTATION_MODES = [
  { id: "virtual", label: "Video Call", blurb: "Zoom / Meet session with screen sharing", icon: "Video", price: 100000 },
  { id: "phone", label: "Phone Call", blurb: "Voice consultation at your scheduled time", icon: "Phone", price: 100000 },
  { id: "physical", label: "In-Person", blurb: "On-site visit or studio appointment", icon: "MapPin", price: 150000 },
] as const;

/** Promotional pricing for a consultation session. */
export const CONSULTATION_PRICING = {
  oldPrice: 250000,
  currentPrice: 100000,
  currency: "NGN",
  discountLabel: "Save 60%",
  offerLabel: "Limited-Time Offer",
};

/**
 * Consultation categories. Admins can add/remove these from the CMS
 * (this array is the seed source of truth).
 */
export const CONSULTATION_TYPES = [
  "Interior Design Consultation",
  "Luxury Interior Consultation",
  "Residential Consultation",
  "Commercial Interior Consultation",
  "Office Space Consultation",
  "Restaurant Interior Consultation",
  "Hotel Interior Consultation",
  "Retail Store Consultation",
  "Smart Home Consultation",
  "Renovation Consultation",
  "Space Planning Consultation",
  "Space Optimization Consultation",
  "Furniture Selection Consultation",
  "Material Selection Consultation",
  "Lighting Design Consultation",
  "Kitchen Design Consultation",
  "Bathroom Design Consultation",
  "Color Consultation",
  "AI Estimate Review",
  "Cost Optimization Consultation",
  "Procurement Strategy Consultation",
  "Vendor Selection Consultation",
  "Strategy Review Consultation",
  "Construction Coordination Consultation",
  "Turnkey Project Consultation",
  "Project Supervision Consultation",
  "Virtual Walkthrough Consultation",
  "Investment Property Interior Consultation",
  "Airbnb Interior Consultation",
  "Custom Consultation",
] as const;
