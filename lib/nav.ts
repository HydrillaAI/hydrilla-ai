export type NavIconName =
  | "text"
  | "image"
  | "bluefox"
  | "water"
  | "features"
  | "preview"
  | "export"
  | "api"
  | "integrations"
  | "rigging"
  | "enterprise"
  | "security"
  | "game"
  | "film"
  | "architecture"
  | "arvr"
  | "product"
  | "studio"
  | "startup"
  | "docs"
  | "faq"
  | "blog"
  | "changelog"
  | "compare"
  | "about"
  | "team"
  | "careers"
  | "contact"
  | "research"
  | "brand";

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  icon?: NavIconName;
  badge?: string;
};

export type NavColumn = {
  heading: string;
  items: NavLink[];
};

export type NavFeatured = {
  eyebrow: string;
  title: string;
  href: string;
  visual: "formats" | "game" | "docs" | "lab";
};

export type NavGroup = {
  label: string;
  href: string;
  columns?: NavColumn[];
  featured?: NavFeatured;
};

export const NAV_PRIMARY: NavGroup[] = [
  {
    label: "Product",
    href: "/features",
    columns: [
      {
        heading: "Product",
        items: [
          { label: "Overview", href: "/features" },
          { label: "BlueFox", href: "/bluefox", description: "The flagship model" },
          { label: "Water Agent", href: "/water", description: "AI 3D agent for studios" },
          { label: "Text to 3D", href: "/text-to-3d" },
          { label: "Image to 3D", href: "/image-to-3d" },
          { label: "Integrations", href: "/integrations" },
          { label: "API", href: "/api" },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    columns: [
      {
        heading: "Solutions",
        items: [
          { label: "Game development", href: "/solutions/games" },
          { label: "Film and animation", href: "/solutions/film" },
          { label: "Architecture and interiors", href: "/solutions/architecture" },
          { label: "XR", href: "/solutions/xr" },
          { label: "Product visualization", href: "/solutions/product" },
          { label: "All solutions", href: "/solutions" },
          { label: "Enterprise", href: "/enterprise" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: "/docs",
    columns: [
      {
        heading: "Resources",
        items: [
          { label: "Docs", href: "/docs" },
          { label: "FAQ", href: "/faq" },
          { label: "Blog", href: "/blog" },
          { label: "Changelog", href: "/changelog" },
          { label: "Compare", href: "/compare" },
        ],
      },
      {
        heading: "Compare",
        items: [
          { label: "Hydrilla vs Meshy", href: "/compare/meshy" },
          { label: "Hydrilla vs Tripo", href: "/compare/tripo" },
          { label: "Hydrilla vs Hyper3D", href: "/compare/hyper3d" },
          { label: "How to choose an AI 3D generator", href: "/compare/how-to-choose" },
        ],
      },
    ],
  },
  {
    label: "Company",
    href: "/about",
    columns: [
      {
        heading: "Company",
        items: [
          { label: "About", href: "/about" },
          { label: "Research", href: "/research" },
          { label: "Team", href: "/team" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
          { label: "Security", href: "/security" },
        ],
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
];

export const FOOTER_NAV: Array<{
  heading: string;
  links: NavLink[];
  row?: 1 | 2;
  col?: number;
}> = [
  {
    heading: "Product",
    row: 1,
    col: 1,
    links: [
      { label: "Overview", href: "/features" },
      { label: "BlueFox", href: "/bluefox" },
      { label: "Water Agent", href: "/water" },
      { label: "Text to 3D", href: "/text-to-3d" },
      { label: "Image to 3D", href: "/image-to-3d" },
      { label: "Integrations", href: "/integrations" },
      { label: "API", href: "/api" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Solutions",
    row: 1,
    col: 2,
    links: [
      { label: "Game development", href: "/solutions/games" },
      { label: "Film and animation", href: "/solutions/film" },
      { label: "Architecture and interiors", href: "/solutions/architecture" },
      { label: "XR", href: "/solutions/xr" },
      { label: "Product visualization", href: "/solutions/product" },
      { label: "All solutions", href: "/solutions" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    heading: "Resources",
    row: 1,
    col: 3,
    links: [
      { label: "Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Compare", href: "/compare" },
    ],
  },
  {
    heading: "Company",
    row: 1,
    col: 4,
    links: [
      { label: "About", href: "/about" },
      { label: "Research", href: "/research" },
      { label: "Team", href: "/team" },
      { label: "Careers", href: "/careers", badge: "We're hiring" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
    ],
  },
];

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];
