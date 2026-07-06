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
    id: "d1", name: "Ada Okonkwo", title: "Principal Designer", initials: "AO",
    rating: 4.9, projects: 182, specialties: ["Luxury", "Residential"], rate: 100000,
    gradient: "from-amber-300 to-orange-400", photo: "/gallery/founder.jpg",
    bio: "Award-winning principal designer specialising in luxury residential interiors, with a signature warm-modern aesthetic.",
    experienceYears: 12, languages: ["English", "Yoruba"], certifications: ["NIID Certified", "LEED Green Associate"],
    responseTime: "under 2 hours", successRate: 98, completedConsultations: 640, online: true,
  },
  {
    id: "d2", name: "Marcus Bello", title: "Commercial Lead", initials: "MB",
    rating: 4.8, projects: 143, specialties: ["Hospitality", "Commercial"], rate: 100000,
    gradient: "from-indigo-300 to-purple-400",
    bio: "Leads large-scale hospitality and commercial fit-outs, from boutique hotels to corporate HQs.",
    experienceYears: 15, languages: ["English", "French"], certifications: ["NIID Certified", "PMP"],
    responseTime: "under 3 hours", successRate: 96, completedConsultations: 512, online: false,
  },
  {
    id: "d3", name: "Zara Khan", title: "Senior Designer", initials: "ZK",
    rating: 4.9, projects: 210, specialties: ["Minimalist", "Japandi"], rate: 100000,
    gradient: "from-emerald-300 to-teal-400",
    bio: "Minimalist and Japandi specialist focused on calm, functional spaces with natural materials.",
    experienceYears: 9, languages: ["English", "Urdu", "Arabic"], certifications: ["NIID Certified"],
    responseTime: "under 1 hour", successRate: 99, completedConsultations: 730, online: true,
  },
  {
    id: "d4", name: "Tunde Adeyemi", title: "Design Consultant", initials: "TA",
    rating: 4.7, projects: 96, specialties: ["Afro-Modern", "Restaurant"], rate: 100000,
    gradient: "from-rose-300 to-amber-300",
    bio: "Blends Afro-modern motifs with contemporary function for restaurants, lounges and homes.",
    experienceYears: 7, languages: ["English", "Yoruba", "Igbo"], certifications: ["NIID Associate"],
    responseTime: "under 4 hours", successRate: 94, completedConsultations: 288, online: true,
  },
];

export const CONSULTATION_MODES = [
  { id: "virtual", label: "Video Call", blurb: "Zoom / Meet session with screen sharing", icon: "Video" },
  { id: "phone", label: "Phone Call", blurb: "Voice consultation at your scheduled time", icon: "Phone" },
  { id: "physical", label: "In-Person", blurb: "On-site visit or studio appointment", icon: "MapPin" },
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
