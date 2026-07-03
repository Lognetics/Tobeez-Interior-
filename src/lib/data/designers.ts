/** Mock roster of interior designers for consultations. */
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
};

export const DESIGNERS: Designer[] = [
  { id: "d1", name: "Ada Okonkwo", title: "Principal Designer", initials: "AO", rating: 4.9, projects: 182, specialties: ["Luxury", "Residential"], rate: 75000, gradient: "from-amber-300 to-orange-400" },
  { id: "d2", name: "Marcus Bello", title: "Commercial Lead", initials: "MB", rating: 4.8, projects: 143, specialties: ["Hospitality", "Commercial"], rate: 90000, gradient: "from-indigo-300 to-purple-400" },
  { id: "d3", name: "Zara Khan", title: "Senior Designer", initials: "ZK", rating: 4.9, projects: 210, specialties: ["Minimalist", "Japandi"], rate: 65000, gradient: "from-emerald-300 to-teal-400" },
  { id: "d4", name: "Tunde Adeyemi", title: "Design Consultant", initials: "TA", rating: 4.7, projects: 96, specialties: ["Afro-Modern", "Restaurant"], rate: 55000, gradient: "from-rose-300 to-amber-300" },
];

export const CONSULTATION_MODES = [
  { id: "virtual", label: "Video Call", blurb: "Zoom / Meet session with screen sharing", icon: "Video" },
  { id: "phone", label: "Phone Call", blurb: "Voice consultation at your scheduled time", icon: "Phone" },
  { id: "physical", label: "In-Person", blurb: "On-site visit or studio appointment", icon: "MapPin" },
] as const;
