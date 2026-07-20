import "server-only";

import { site } from "@/lib/site";
import {
  BUILDING_TYPES,
  DESIGN_STYLES,
  FURNITURE_QUALITY,
  MATERIALS,
  PROPERTY_CATEGORIES,
  REGIONS,
} from "@/lib/estimator/constants";
import {
  CONSULTATION_MODES,
  CONSULTATION_PRICING,
  CONSULTATION_TYPES,
  DESIGNERS,
  type Designer,
} from "@/lib/data/designers";
import { PRODUCTS, type Product } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils";

export type KnowledgeSource = {
  id: string;
  title: string;
  href: string;
  category: "platform" | "estimator" | "marketplace" | "consultation" | "account";
};

type KnowledgeChunk = KnowledgeSource & {
  content: string;
  keywords: string[];
  fallbackAnswer: string;
};

export type RetrievalResult = {
  source: KnowledgeSource;
  content: string;
  score: number;
  fallbackAnswer: string;
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for",
  "from", "i", "in", "is", "it", "me", "my", "of", "on", "or", "please", "the",
  "this", "to", "we", "what", "when", "where", "which", "who", "with", "you", "your",
]);

const CATEGORY_TERMS: Record<KnowledgeSource["category"], string[]> = {
  platform: ["platform", "service", "services", "feature", "features", "work", "about"],
  estimator: ["estimate", "estimator", "budget", "cost", "furnish", "furnishing", "property", "bedroom"],
  marketplace: ["marketplace", "product", "products", "buy", "shop", "price", "furniture", "lighting", "decor"],
  consultation: ["consultation", "consultant", "designer", "expert", "book", "booking", "session", "appointment"],
  account: ["account", "dashboard", "project", "projects", "invoice", "invoices", "order", "orders", "document"],
};

function normalise(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(token: string) {
  if (token.length > 6 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 5 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function tokens(value: string) {
  return normalise(value)
    .split(" ")
    .map(stem)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function baseChunks(): KnowledgeChunk[] {
  const categories = PROPERTY_CATEGORIES.map((item) => item.label).join(", ");
  const buildingTypes = BUILDING_TYPES.join(", ");
  const styles = DESIGN_STYLES.map((item) => item.label).join(", ");
  const qualityLevels = FURNITURE_QUALITY.map((item) => item.label).join(", ");
  const regions = REGIONS.map((item) => item.label).join(", ");
  const materials = MATERIALS.join(", ");
  const consultationModes = CONSULTATION_MODES.map((item) => item.label).join(", ");
  const consultationPrice = formatCurrency(
    CONSULTATION_PRICING.currentPrice,
    CONSULTATION_PRICING.currency,
  );

  return [
    {
      id: "platform-overview",
      title: "About the TOBEEZ platform",
      href: "/about",
      category: "platform",
      keywords: ["interior planning", "services", "how it works", "tobeez ai"],
      content:
        `${site.name} is an intelligent interior-planning platform. It combines a cost estimator, ` +
        "AI design studio, curated product marketplace, expert consultations, and project dashboards. " +
        "The usual flow is: describe a space, generate an itemised estimate, refine the plan with an expert, " +
        "then source products and manage the project.",
      fallbackAnswer:
        "TOBEEZ brings interior cost estimation, AI-assisted design, product sourcing, expert consultations, and project tracking into one platform.",
    },
    {
      id: "estimator-overview",
      title: "AI Cost Estimator",
      href: "/estimator",
      category: "estimator",
      keywords: ["3 bedroom", "three bedroom", "quote", "pricing", "free estimate", "itemised"],
      content:
        "The TOBEEZ AI Cost Estimator is a free guided wizard that creates an itemised, region-adjusted " +
        "furnishing estimate with minimum, recommended, and maximum ranges. It accounts for property type, " +
        "floor area, project stage, rooms, location, design style, furniture quality, finishes, professional " +
        "fees, VAT, contingency, and selected special features. A reliable total requires those project details; " +
        "the assistant should not invent a fixed price from bedroom count alone.",
      fallbackAnswer:
        "TOBEEZ can estimate a 3-bedroom project, but bedroom count alone is not enough for a reliable figure. Location, floor area, rooms, style, quality level, project stage, and special features all affect the range. Start the free estimator to get an itemised result.",
    },
    {
      id: "estimator-coverage",
      title: "Estimator options and coverage",
      href: "/estimator",
      category: "estimator",
      keywords: ["supported", "property type", "region", "style", "quality", "material"],
      content:
        `Supported property categories: ${categories}. Building types include ${buildingTypes}. ` +
        `Design styles include ${styles}. Furniture quality levels: ${qualityLevels}. ` +
        `Configured regions: ${regions}. Material preferences include ${materials}.`,
      fallbackAnswer:
        "The estimator supports residential, commercial, hospitality, healthcare, education, worship, government, industrial, luxury, and mixed-use projects, with multiple styles, quality levels, materials, and regional adjustments.",
    },
    {
      id: "estimator-accuracy",
      title: "Estimate cost and accuracy",
      href: "/#faq",
      category: "estimator",
      keywords: ["accurate", "accuracy", "card", "pay", "range"],
      content:
        "The AI Cost Estimator is free to use and does not require a card. Results are itemised across " +
        "furniture, finishes, labour, tax, and contingency. Estimates are planning ranges rather than binding " +
        "supplier quotations, and accuracy improves when the user supplies more project detail.",
      fallbackAnswer:
        "The estimator is free and needs no card. It produces an itemised planning range, and the result becomes more useful as you provide fuller project details.",
    },
    {
      id: "ai-studio",
      title: "AI Design Studio",
      href: "/studio",
      category: "platform",
      keywords: ["image", "images", "room photo", "redesign", "moodboard", "visualise", "generate"],
      content:
        "The AI Design Studio lets users chat about a space, generate interior concepts and images, upload a " +
        "room photo for redesign guidance, and save generated designs to their dashboard documents.",
      fallbackAnswer:
        "Use the AI Design Studio to explore a room, generate visual concepts, upload a room photo for redesign guidance, and save designs to your dashboard.",
    },
    {
      id: "marketplace-overview",
      title: "TOBEEZ Marketplace",
      href: "/marketplace",
      category: "marketplace",
      keywords: ["catalogue", "catalog", "wishlist", "delivery", "compare", "brands"],
      content:
        "The TOBEEZ Marketplace contains curated furniture, lighting, kitchen, bathroom, decor, curtains, " +
        "outdoor, and office products from vetted brands. Users can search and filter the catalogue, save " +
        "items to a wishlist, add products to a cart, and track completed purchases from the dashboard.",
      fallbackAnswer:
        "The Marketplace offers curated furniture, lighting, kitchen, bathroom, decor, curtains, outdoor, and office products, with search, filters, wishlists, cart, checkout, and order tracking.",
    },
    {
      id: "consultation-booking",
      title: "Book an interior consultation",
      href: "/consultation",
      category: "consultation",
      keywords: ["virtual", "phone", "in person", "video", "moodboard", "schedule"],
      content:
        `TOBEEZ consultations are currently listed at ${consultationPrice} per session under a limited-time ` +
        `offer (previously ${formatCurrency(CONSULTATION_PRICING.oldPrice, CONSULTATION_PRICING.currency)}). ` +
        `Available modes are ${consultationModes}. The booking flow is: choose one of ` +
        `${CONSULTATION_TYPES.length} consultation types, select a consultant, choose a date and time, then pay. ` +
        "Every consultation session runs for two hours and includes a moodboard review.",
      fallbackAnswer:
        `A TOBEEZ consultation is currently listed at ${consultationPrice} under a limited-time offer. ` +
        `You can book a ${consultationModes.toLowerCase()} session, then choose the focus, consultant, date, and time.`,
    },
    {
      id: "account-dashboard",
      title: "Client dashboard and project tracking",
      href: "/dashboard",
      category: "account",
      keywords: ["saved", "track", "manage", "messages", "wishlist", "receipts"],
      content:
        "The client dashboard brings together projects, saved estimates, consultations, marketplace orders, " +
        "invoices, documents, messages, saved designs, notifications, and wishlist items. Projects can be " +
        "created from an unlocked estimate or added manually.",
      fallbackAnswer:
        "Your client dashboard keeps projects, saved estimates, consultations, orders, invoices, documents, messages, designs, notifications, and wishlist items together.",
    },
    {
      id: "contact",
      title: "Contact TOBEEZ",
      href: "/about#contact",
      category: "platform",
      keywords: ["email", "phone", "address", "location", "contact", "support"],
      content: `Email: ${site.email}. Phone: ${site.phone}. Address: ${site.address}.`,
      fallbackAnswer: `You can contact TOBEEZ at ${site.email} or ${site.phone}. The listed address is ${site.address}.`,
    },
  ];
}

function productChunks(products: Product[]): KnowledgeChunk[] {
  return products.map((product) => {
    const price = formatCurrency(product.price);
    const tag = product.tag ? ` It is tagged ${product.tag}.` : "";
    return {
      id: `product-${product.id}`,
      title: product.name,
      href: `/marketplace/${product.id}`,
      category: "marketplace" as const,
      keywords: [product.brand, product.category, "product", "price", product.tag ?? ""],
      content:
        `${product.name} by ${product.brand} is a ${product.category} product currently listed at ${price}. ` +
        `It has a ${product.rating}/5 rating from ${product.reviews} reviews.${tag}`,
      fallbackAnswer:
        `${product.name} by ${product.brand} is currently listed at ${price}. ` +
        `It is rated ${product.rating}/5 from ${product.reviews} reviews.${tag}`,
    };
  });
}

function designerChunks(designers: Designer[]): KnowledgeChunk[] {
  return designers.map((designer) => ({
    id: `designer-${designer.id}`,
    title: designer.name,
    href: "/consultation",
    category: "consultation" as const,
    keywords: [designer.title, ...designer.specialties, ...designer.languages, "designer", "consultant"],
    content:
      `${designer.name} is a ${designer.title} with ${designer.experienceYears} years of experience. ` +
      `Specialties: ${designer.specialties.join(", ")}. Rating: ${designer.rating}/5 across ` +
      `${designer.projects} projects. Languages: ${designer.languages.join(", ")}. ` +
      `Typical response time: ${designer.responseTime}. Consultation rate: ${formatCurrency(designer.rate)}. ` +
      `Profile: ${designer.bio}`,
    fallbackAnswer:
      `${designer.name} is a ${designer.title} specialising in ${designer.specialties.join(" and ")}. ` +
      `The profile shows ${designer.experienceYears} years of experience, a ${designer.rating}/5 rating, ` +
      `and a ${formatCurrency(designer.rate)} consultation rate.`,
  }));
}

function primaryCategory(query: string): KnowledgeSource["category"] | null {
  const queryTokens = new Set(tokens(query));
  const hasAny = (signals: string[]) => signals.some((signal) => queryTokens.has(stem(signal)));
  const normalisedQuery = normalise(query);

  if (hasAny(["consultation", "consultant", "designer", "booking", "session", "appointment"])) {
    return "consultation";
  }
  if (hasAny([
    "marketplace", "product", "buy", "shop", "sofa", "couch", "chair", "table", "lamp",
    "curtain", "desk", "ottoman", "shower", "island", "vase", "rattan", "lighting",
  ])) {
    return "marketplace";
  }
  if (hasAny(["estimate", "estimator", "budget", "furnish", "bedroom", "property", "quote"])) {
    return "estimator";
  }
  if (
    hasAny(["style", "material", "palette", "colour", "color", "finish"]) ||
    DESIGN_STYLES.some((style) => normalisedQuery.includes(normalise(style.label))) ||
    MATERIALS.some((material) => normalisedQuery.includes(normalise(material)))
  ) {
    return "estimator";
  }
  if (hasAny(["account", "dashboard", "project", "invoice", "order", "document", "wishlist"])) {
    return "account";
  }
  if (hasAny(["platform", "service", "feature", "tobeez", "contact", "support", "email", "address"])) {
    return "platform";
  }
  return null;
}

function scoreChunk(
  query: string,
  chunk: KnowledgeChunk,
  preferredCategory: KnowledgeSource["category"] | null,
) {
  const queryTokens = [...new Set(tokens(query))];
  if (!queryTokens.length) return 0;

  const title = normalise(chunk.title);
  const titleTokens = new Set(tokens(chunk.title));
  const keywordTokens = new Set(tokens(chunk.keywords.join(" ")));
  const contentTokens = new Set(tokens(chunk.content));
  let score = 0;

  for (const token of queryTokens) {
    if (titleTokens.has(token)) score += 6;
    if (keywordTokens.has(token)) score += 3.5;
    if (contentTokens.has(token)) score += 1.4;

    if (token.length >= 5) {
      if ([...titleTokens].some((candidate) => candidate.startsWith(token) || token.startsWith(candidate))) score += 2;
      if ([...keywordTokens].some((candidate) => candidate.startsWith(token) || token.startsWith(candidate))) score += 1;
    }
  }

  const normalisedQuery = normalise(query);
  if (normalisedQuery.length >= 4 && title.includes(normalisedQuery)) score += 10;

  const categorySignals = CATEGORY_TERMS[chunk.category].map(stem);
  const signalMatches = queryTokens.filter((token) => categorySignals.includes(token)).length;
  score += signalMatches * 2.25;
  const isSpecificRecord = chunk.id.startsWith("product-") || chunk.id.startsWith("designer-");
  if (preferredCategory === chunk.category && (!isSpecificRecord || score >= 4)) score += 9;

  return score;
}

function isExplicitPlatformQuestion(query: string, products: Product[], designers: Designer[]) {
  const value = normalise(query);
  const platformSignals = [
    "tobeez", "platform", "estimator", "marketplace", "consultation", "consultant", "book a",
    "dashboard", "your product", "your service", "your price", "how much is", "do you have",
    "estimate", "furnish", "furnishing", "bedroom cost", "3 bedroom", "three bedroom",
  ];
  return (
    platformSignals.some((signal) => value.includes(signal)) ||
    products.some((product) => value.includes(normalise(product.name))) ||
    designers.some((designer) => value.includes(normalise(designer.name)))
  );
}

export function retrievePlatformKnowledge(
  query: string,
  options: { products?: Product[]; designers?: Designer[]; limit?: number } = {},
) {
  const products = options.products ?? PRODUCTS;
  const designers = options.designers ?? DESIGNERS;
  const chunks = [...baseChunks(), ...productChunks(products), ...designerChunks(designers)];
  const preferredCategory = primaryCategory(query);
  const ranked = chunks
    .map((chunk) => ({
      source: {
        id: chunk.id,
        title: chunk.title,
        href: chunk.href,
        category: chunk.category,
      },
      content: chunk.content,
      score: scoreChunk(query, chunk, preferredCategory),
      fallbackAnswer: chunk.fallbackAnswer,
    }))
    .filter((result) => result.score >= 5)
    .sort((a, b) => b.score - a.score);
  const topResult = ranked[0];
  const results = ranked
    .filter(
      (result) =>
        !topResult ||
        (preferredCategory
          ? result.source.category === preferredCategory
          : result.source.category === topResult.source.category || result.score >= topResult.score * 0.8),
    )
    .slice(0, options.limit ?? 5);

  return {
    results,
    explicitPlatformQuestion: isExplicitPlatformQuestion(query, products, designers),
    knowledgeSize: chunks.length,
  };
}

export function buildGroundingMessage(query: string, results: RetrievalResult[]) {
  if (!results.length) {
    return (
      "No TOBEEZ platform records were relevant to this question. You may answer general interior-design " +
      "questions from professional knowledge, but do not make claims about TOBEEZ prices, products, policies, " +
      "availability, people, or features. Ask a clarifying question when needed."
    );
  }

  const records = results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.source.title} (${result.source.href})\n${result.content}`,
    )
    .join("\n\n");

  return (
    `The user asked: ${query}\n\n` +
    "Use the retrieved TOBEEZ records below as the only source of truth for platform-specific claims. " +
    "Do not invent missing prices, availability, policies, people, or capabilities. If the records do not " +
    "contain the requested platform fact, say that you do not have that information and point the user to the " +
    "closest relevant page. You may still use professional interior-design knowledge for general design advice. " +
    "Keep the answer concise. Do not include markdown links, absolute URLs, or a separate sources list; the " +
    "interface renders the verified source links.\n\n" +
    records
  );
}

export function buildGroundedFallback(
  results: RetrievalResult[],
  explicitPlatformQuestion: boolean,
) {
  if (!results.length || !explicitPlatformQuestion) return null;

  return results[0].fallbackAnswer;
}
