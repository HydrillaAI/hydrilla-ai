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
  image?: string;
  imageAlt?: string;
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
        heading: "Generate",
        items: [
          { label: "BlueFox", href: "/bluefox", description: "The flagship model", icon: "bluefox" },
          { label: "World Models", href: "/world-models", description: "Explore Hydrilla's model stack", icon: "bluefox" },
          { label: "Text to 3D", href: "/text-to-3d", description: "Describe it, get a model", icon: "text" },
          { label: "Image to 3D", href: "/image-to-3d", description: "Turn a reference into a mesh", icon: "image" },
          { label: "Water Agent", href: "/water", description: "AI 3D agent for studios", icon: "water" },
        ],
      },
      {
        heading: "Platform",
        items: [
          { label: "Overview", href: "/features", description: "Everything in Hydrilla", icon: "features" },
          { label: "Integrations", href: "/integrations", description: "Plug into your 3D tools", icon: "integrations" },
          { label: "API", href: "/api", description: "Generate from your own code", icon: "api" },
        ],
      },
    ],
    featured: {
      eyebrow: "Flagship model",
      title: "Meet BlueFox, the model behind Hydrilla",
      href: "/bluefox",
      visual: "lab",
      image: "/new-features/3df1.png",
      imageAlt: "A generated fantasy helmet next to its text prompt and reference image",
    },
  },
  {
    label: "Solutions",
    href: "/solutions",
    columns: [
      {
        heading: "Industries",
        items: [
          { label: "Game development", href: "/solutions/games", description: "Props, characters, environments", icon: "game" },
          { label: "Film and animation", href: "/solutions/film", description: "Assets for pipelines", icon: "film" },
          { label: "Architecture and interiors", href: "/solutions/architecture", description: "Spaces and furnishings", icon: "architecture" },
          { label: "XR", href: "/solutions/xr", description: "AR and VR content", icon: "arvr" },
          { label: "Product visualization", href: "/solutions/product", description: "Showcase and prototype", icon: "product" },
        ],
      },
      {
        heading: "Teams",
        items: [
          { label: "All solutions", href: "/solutions", description: "Browse every use case", icon: "features" },
          { label: "Enterprise", href: "/enterprise", description: "Scale across your organisation", icon: "enterprise" },
        ],
      },
    ],
    featured: {
      eyebrow: "Solutions",
      title: "3D for games, film, XR and product teams",
      href: "/solutions",
      visual: "game",
      image: "/usecase/games.jpg",
      imageAlt: "A character standing in a field of flowers in a game world",
    },
  },
  {
    label: "Resources",
    href: "/docs",
    columns: [
      {
        heading: "Learn",
        items: [
          { label: "Docs", href: "/docs", description: "Guides and reference", icon: "docs" },
          { label: "FAQ", href: "/faq", description: "Quick answers", icon: "faq" },
          { label: "Blog", href: "/blog", description: "Notes from the team", icon: "blog" },
          { label: "Changelog", href: "/changelog", description: "What shipped lately", icon: "changelog" },
        ],
      },
      {
        heading: "Compare",
        items: [
          { label: "Compare overview", href: "/compare", description: "Hydrilla against the rest", icon: "compare" },
          { label: "Hydrilla vs Meshy", href: "/compare/meshy", icon: "compare" },
          { label: "Hydrilla vs Tripo", href: "/compare/tripo", icon: "compare" },
          { label: "Hydrilla vs Hyper3D", href: "/compare/hyper3d", icon: "compare" },
        ],
      },
    ],
    featured: {
      eyebrow: "Guide",
      title: "How to choose an AI 3D generator",
      href: "/compare/how-to-choose",
      visual: "docs",
      image: "/features/3d1.png",
      imageAlt: "A text prompt and an uploaded image turned into a 3D house model",
    },
  },
  {
    label: "Company",
    href: "/about",
    columns: [
      {
        heading: "Our company",
        items: [
          { label: "About", href: "/about", description: "Why we build Hydrilla", icon: "about" },
          { label: "Research", href: "/research", description: "The work behind the models", icon: "research" },
          { label: "Team", href: "/team", description: "The people building it", icon: "team" },
          { label: "Careers", href: "/careers", description: "Join us", icon: "careers" },
        ],
      },
      {
        heading: "Get in touch",
        items: [
          { label: "Contact", href: "/contact", description: "Talk to the team", icon: "contact" },
          { label: "Security", href: "/security", description: "How we protect your work", icon: "security" },
        ],
      },
    ],
    featured: {
      eyebrow: "Research",
      title: "The research behind Hydrilla",
      href: "/research",
      visual: "lab",
      image: "/workflow/generated-model1.png",
      imageAlt: "A character shown as a wireframe beside its finished 3D model",
    },
  },
  { label: "Community", href: "/discover" },
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
      { label: "World Models", href: "/world-models" },
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
      { label: "Community", href: "/discover" },
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
  { label: "Community Guidelines", href: "/community-guidelines" },
];
