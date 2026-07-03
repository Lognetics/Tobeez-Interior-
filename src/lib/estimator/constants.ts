/**
 * Domain constants for the AI Cost Estimator.
 * These drive the wizard UI and the (stubbed) cost engine.
 */

export const PROPERTY_CATEGORIES = [
  { id: "residential", label: "Residential", icon: "Home", blurb: "Apartments, duplexes, villas & mansions" },
  { id: "commercial", label: "Commercial", icon: "Building2", blurb: "Offices, retail, corporate spaces" },
  { id: "hospitality", label: "Hospitality", icon: "Hotel", blurb: "Hotels, resorts, restaurants, bars" },
  { id: "healthcare", label: "Healthcare", icon: "Stethoscope", blurb: "Hospitals, clinics, wellness centres" },
  { id: "education", label: "Education", icon: "GraduationCap", blurb: "Schools, universities, libraries" },
  { id: "worship", label: "Worship", icon: "Church", blurb: "Churches, mosques, event centres" },
  { id: "government", label: "Government", icon: "Landmark", blurb: "Public & institutional buildings" },
  { id: "industrial", label: "Industrial", icon: "Factory", blurb: "Factories, warehouses, facilities" },
  { id: "luxury", label: "Luxury", icon: "Gem", blurb: "Ultra-premium & bespoke projects" },
  { id: "mixed", label: "Mixed Use", icon: "LayoutGrid", blurb: "Combined residential & commercial" },
] as const;

export const BUILDING_TYPES = [
  "Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom", "Penthouse",
  "Maisonette", "Terrace", "Duplex", "Bungalow", "Villa", "Mansion",
  "Office", "Restaurant", "Hotel", "Church", "Mall", "Factory",
  "Warehouse", "School", "Hospital", "Clinic", "Event Centre", "Custom",
] as const;

export const PROJECT_STAGES = [
  { id: "existing", label: "Existing Building", multiplier: 1 },
  { id: "new", label: "New Construction", multiplier: 1.05 },
  { id: "renovation", label: "Renovation", multiplier: 1.15 },
  { id: "shell", label: "Shell Building", multiplier: 1.25 },
  { id: "upgrade", label: "Luxury Upgrade", multiplier: 1.4 },
  { id: "partial", label: "Partial Furnishing", multiplier: 0.6 },
  { id: "complete", label: "Complete Furnishing", multiplier: 1 },
] as const;

export const ROOMS = [
  "Living Room", "Dining", "Kitchen", "Master Suite", "Bedroom", "Guest Room",
  "Children Room", "Home Office", "Cinema", "Gym", "Bar", "Library",
  "Reception", "Waiting Area", "Conference Room", "Prayer Room", "Laundry",
  "Store", "Balcony", "Garden", "Pool Area", "Parking", "Security House", "Outdoor",
] as const;

export const DESIGN_STYLES = [
  { id: "modern", label: "Modern", multiplier: 1 },
  { id: "minimalist", label: "Minimalist", multiplier: 0.95 },
  { id: "contemporary", label: "Contemporary", multiplier: 1.05 },
  { id: "luxury", label: "Luxury", multiplier: 1.6 },
  { id: "ultra-luxury", label: "Ultra Luxury", multiplier: 2.4 },
  { id: "industrial", label: "Industrial", multiplier: 1.1 },
  { id: "scandinavian", label: "Scandinavian", multiplier: 1.05 },
  { id: "japandi", label: "Japandi", multiplier: 1.15 },
  { id: "traditional", label: "Traditional", multiplier: 1.1 },
  { id: "classic", label: "Classic", multiplier: 1.3 },
  { id: "african", label: "Afro-Modern", multiplier: 1.1 },
  { id: "bohemian", label: "Bohemian", multiplier: 1 },
  { id: "mediterranean", label: "Mediterranean", multiplier: 1.2 },
  { id: "art-deco", label: "Art Deco", multiplier: 1.45 },
  { id: "farmhouse", label: "Farmhouse", multiplier: 1.05 },
] as const;

export const MATERIALS = [
  "Tiles", "Wood", "Marble", "Granite", "Concrete", "Vinyl", "Wallpaper",
  "Luxury Paint", "Fabric", "Leather", "Glass", "Steel", "Aluminium", "Stone", "Composite",
] as const;

export const FURNITURE_QUALITY = [
  { id: "economy", label: "Economy", multiplier: 0.65 },
  { id: "standard", label: "Standard", multiplier: 1 },
  { id: "premium", label: "Premium", multiplier: 1.5 },
  { id: "luxury", label: "Luxury", multiplier: 2.2 },
  { id: "ultra", label: "Ultra Luxury", multiplier: 3.4 },
  { id: "imported", label: "Imported", multiplier: 2.8 },
  { id: "custom", label: "Custom-made", multiplier: 2.5 },
] as const;

export const TIMELINES = [
  "Immediately", "30 Days", "60 Days", "90 Days", "6 Months", "1 Year", "Flexible",
] as const;

export const SPECIAL_FEATURES = [
  { id: "smart-home", label: "Smart Home", cost: 2500000 },
  { id: "voice", label: "Voice Control", cost: 800000 },
  { id: "solar", label: "Solar & Inverter", cost: 6500000 },
  { id: "security", label: "Security System", cost: 1800000 },
  { id: "automation", label: "Automation", cost: 3200000 },
  { id: "cinema", label: "Home Cinema", cost: 4500000 },
  { id: "gaming", label: "Gaming Room", cost: 2200000 },
  { id: "acoustics", label: "Acoustic Treatment", cost: 1500000 },
  { id: "lighting", label: "Luxury Lighting", cost: 2800000 },
] as const;

/** Regional cost-of-living multipliers (stub, replace with live price index). */
export const REGIONS = [
  { id: "lagos", label: "Lagos, Nigeria", multiplier: 1.2, currency: "NGN" },
  { id: "abuja", label: "Abuja, Nigeria", multiplier: 1.15, currency: "NGN" },
  { id: "ph", label: "Port Harcourt, Nigeria", multiplier: 1.05, currency: "NGN" },
  { id: "accra", label: "Accra, Ghana", multiplier: 1.1, currency: "NGN" },
  { id: "nairobi", label: "Nairobi, Kenya", multiplier: 1.0, currency: "NGN" },
  { id: "other", label: "Other Region", multiplier: 1.0, currency: "NGN" },
] as const;

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number]["id"];
export type ProjectStage = (typeof PROJECT_STAGES)[number]["id"];
export type DesignStyle = (typeof DESIGN_STYLES)[number]["id"];
export type FurnitureQuality = (typeof FURNITURE_QUALITY)[number]["id"];
