/** Sidebar navigation configs for each dashboard role. Icons are lucide names. */
export type DashNavItem = { label: string; href: string; icon: string };

export const clientNav: DashNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "AI Design Studio", href: "/studio", icon: "Sparkles" },
  { label: "My Projects", href: "/dashboard/projects", icon: "FolderKanban" },
  { label: "Saved Estimates", href: "/dashboard/estimates", icon: "Calculator" },
  { label: "Consultations", href: "/dashboard/consultations", icon: "CalendarClock" },
  { label: "Messages", href: "/dashboard/messages", icon: "MessageSquare" },
  { label: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
  { label: "Invoices", href: "/dashboard/invoices", icon: "Receipt" },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: "Heart" },
  { label: "Documents", href: "/dashboard/documents", icon: "FileText" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

export const designerNav: DashNavItem[] = [
  { label: "Overview", href: "/designer", icon: "LayoutDashboard" },
  { label: "Portfolio", href: "/designer/portfolio", icon: "Images" },
  { label: "Projects", href: "/designer/projects", icon: "FolderKanban" },
  { label: "Leads", href: "/designer/leads", icon: "Target" },
  { label: "Consultations", href: "/designer/consultations", icon: "CalendarClock" },
  { label: "Clients", href: "/designer/clients", icon: "Users" },
  { label: "Earnings", href: "/designer/earnings", icon: "Wallet" },
  { label: "Calendar", href: "/designer/calendar", icon: "Calendar" },
  { label: "Reviews", href: "/designer/reviews", icon: "Star" },
  { label: "Settings", href: "/designer/settings", icon: "Settings" },
];

export const adminNav: DashNavItem[] = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Designers", href: "/admin/designers", icon: "Palette" },
  { label: "Products", href: "/admin/products", icon: "Package" },
  { label: "Orders", href: "/admin/orders", icon: "ShoppingBag" },
  { label: "Pricing DB", href: "/admin/pricing", icon: "DollarSign" },
  { label: "AI Engine", href: "/admin/ai", icon: "Bot" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "CMS", href: "/admin/cms", icon: "FileText" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
];
