import { ENTERPRISE_FAQ, faqPlainText } from "@/lib/enterprise-faq";
import { TEAM_MEMBERS } from "@/lib/team";

const ORG = "https://hydrilla.ai/#organization";
const WEBSITE = "https://hydrilla.ai/#website";
const SOFTWARE = "https://hydrilla.ai/features#software";

const website = {
  "@type": "WebSite",
  "@id": WEBSITE,
  url: "https://hydrilla.ai",
  name: "Hydrilla AI",
  publisher: { "@id": ORG },
};

const software = {
  "@type": "SoftwareApplication",
  "@id": SOFTWARE,
  name: "Hydrilla",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  url: "https://hydrilla.ai/features",
  publisher: { "@id": ORG },
  featureList: [
    "Text to 3D with BlueFox",
    "Image to 3D with BlueFox",
    "Segmented meshes with UVs and PBR maps",
    "In-browser preview",
    "Export to GLB, FBX, OBJ, and USDZ",
    "Plugins for Blender, Unity, Unreal, and Godot",
    "MCP server",
    "REST API",
    "Water Agent",
  ],
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "12",
    url: "https://hydrilla.ai/pricing",
  },
};

const model = {
  "@type": "SoftwareApplication",
  "@id": "https://hydrilla.ai/bluefox#model",
  name: "BlueFox",
  alternateName: "BlueFox 1",
  softwareVersion: "1",
  description: "BlueFox, Hydrilla's 3D model, is built by Hydrilla AI. Its current version is BlueFox 1.",
  disambiguatingDescription: "Hydrilla's 3D model, generally available in Hydrilla",
  applicationCategory: "DesignApplication",
  url: "https://hydrilla.ai/bluefox",
  creator: { "@id": ORG },
  isPartOf: { "@id": SOFTWARE },
  sameAs: ["https://huggingface.co/Hydrilla/BlueFox3D"],
};

const NAMES: Record<string, string> = {
  "/features": "AI 3D Workspace for Studios and Artists",
  "/bluefox": "BlueFox: Hydrilla's AI 3D Model",
  "/water": "Water Agent: The AI 3D Agent for Studios",
  "/text-to-3d": "Text to 3D: Generate a 3D Model from a Prompt",
  "/image-to-3d": "Image to 3D: Turn a Picture into a 3D Model",
  "/integrations": "Integrations: Blender, Unity, Unreal, Godot",
  "/integrations/blender": "Blender Add-on for AI 3D Generation",
  "/integrations/unity": "Unity Plugin for AI 3D Models",
  "/integrations/unreal": "Unreal Engine Plugin for AI 3D Models",
  "/integrations/godot": "Godot 4 Plugin for AI 3D Models",
  "/integrations/mcp": "MCP Server for AI 3D Generation",
  "/api": "REST API: BlueFox Text and Image to 3D",
  "/pricing": "Pricing: Free, Starter, Pro, and Hourly Plans",
  "/solutions": "AI 3D Use Cases: Games, Film, Architecture, XR",
  "/solutions/games": "AI 3D Assets for Game Development",
  "/solutions/film": "AI 3D Assets for Film Previs and Set Dressing",
  "/solutions/architecture": "AI 3D Furniture and Interiors for Archviz",
  "/solutions/xr": "AI 3D Assets for AR, VR, and Spatial Apps",
  "/solutions/product": "AI 3D Product Models for E-commerce",
  "/enterprise": "Enterprise AI 3D Workspace, Agent & Plugins | Hydrilla AI",
  "/docs": "Docs: Get Started with Hydrilla AI 3D",
  "/faq": "Hydrilla FAQ: Licensing, Accounts, and Support",
  "/blog": "Hydrilla Blog: Guides for AI 3D Workflows",
  "/blog/reference-images": "Reference Images for Image to 3D: A Guide",
  "/blog/import-ai-meshes": "Import AI 3D Meshes into Unity, Unreal, Godot",
  "/changelog": "Hydrilla Changelog: AI 3D Product Updates",
  "/compare": "Compare Hydrilla with Meshy, Tripo, Hyper3D, Trellis, and Sloyd",
  "/compare/meshy": "Hydrilla vs Meshy: AI 3D Tools Side by Side",
  "/compare/tripo": "Hydrilla vs Tripo: Inputs, Exports, and API",
  "/compare/hyper3d": "Hydrilla vs Hyper3D Rodin: Facts Side by Side",
  "/compare/trellis": "Hydrilla vs Trellis: Studio Workspace and Open Weights",
  "/compare/sloyd": "Hydrilla vs Sloyd: Generative 3D and Parametric Templates",
  "/compare/how-to-choose": "How to Choose an AI 3D Model Generator",
  "/about": "About: The AI 3D Company Behind BlueFox",
  "/research": "Research: The BlueFox 1 AI 3D Model Card",
  "/team": "Team: The People Behind Hydrilla AI 3D",
  "/careers": "Careers: AI 3D Engineering and Research",
  "/contact": "Contact Hydrilla: AI 3D Support and Press",
  "/security": "Security: How Hydrilla Protects Studio Assets",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/cookies": "Cookie Policy",
  "/brand": "Press Kit",
};

const SECTION: Record<string, { name: string; path: string }> = {
  "/features": { name: "Product", path: "/features" },
  "/bluefox": { name: "Product", path: "/features" },
  "/water": { name: "Product", path: "/features" },
  "/text-to-3d": { name: "Product", path: "/features" },
  "/image-to-3d": { name: "Product", path: "/features" },
  "/integrations": { name: "Product", path: "/features" },
  "/integrations/blender": { name: "Product", path: "/features" },
  "/integrations/unity": { name: "Product", path: "/features" },
  "/integrations/unreal": { name: "Product", path: "/features" },
  "/integrations/godot": { name: "Product", path: "/features" },
  "/integrations/mcp": { name: "Product", path: "/features" },
  "/api": { name: "Product", path: "/features" },
  "/pricing": { name: "Product", path: "/features" },
  "/solutions": { name: "Solutions", path: "/solutions" },
  "/solutions/games": { name: "Solutions", path: "/solutions" },
  "/solutions/film": { name: "Solutions", path: "/solutions" },
  "/solutions/architecture": { name: "Solutions", path: "/solutions" },
  "/solutions/xr": { name: "Solutions", path: "/solutions" },
  "/solutions/product": { name: "Solutions", path: "/solutions" },
  "/enterprise": { name: "Solutions", path: "/solutions" },
  "/docs": { name: "Resources", path: "/docs" },
  "/faq": { name: "Resources", path: "/docs" },
  "/blog": { name: "Resources", path: "/docs" },
  "/blog/reference-images": { name: "Resources", path: "/docs" },
  "/blog/import-ai-meshes": { name: "Resources", path: "/docs" },
  "/changelog": { name: "Resources", path: "/docs" },
  "/compare": { name: "Resources", path: "/docs" },
  "/compare/meshy": { name: "Resources", path: "/docs" },
  "/compare/tripo": { name: "Resources", path: "/docs" },
  "/compare/hyper3d": { name: "Resources", path: "/docs" },
  "/compare/trellis": { name: "Resources", path: "/docs" },
  "/compare/sloyd": { name: "Resources", path: "/docs" },
  "/compare/how-to-choose": { name: "Resources", path: "/docs" },
  "/about": { name: "Company", path: "/about" },
  "/research": { name: "Company", path: "/about" },
  "/team": { name: "Company", path: "/about" },
  "/careers": { name: "Company", path: "/about" },
  "/contact": { name: "Company", path: "/about" },
  "/security": { name: "Company", path: "/about" },
};

const TEAM_ROLES: Record<string, string> = {
  "Tharak Nagaveti": "Co-founder & CEO",
  "Dharani Kumar": "Co-founder & CTO",
  "Tejesh Varma": "CGO",
  "Aditya Sontena": "Lead Developer",
  "Rishik Kalyan": "Creative Director",
  "Hem Charan": "Software Engineer",
  "Krishna Manohar": "Data Scientist",
  "Kishan Kumar": "Marketing Head",
};

const INTEGRATION_HOWTO: Record<string, { name: string; steps: string[] }> = {
  "/integrations/blender": {
    name: "Install from disk",
    steps: [
      "Download hydrilla-blender.zip using the button on this page.",
      "In Blender, open Edit > Preferences > Add-ons.",
      "Open the menu at the top right and choose Install from Disk.",
      "Select hydrilla-blender.zip, then tick the box to enable the Hydrilla add-on.",
      "In the 3D Viewport, press N to open the sidebar, then click the Hydrilla tab.",
    ],
  },
  "/integrations/unity": {
    name: "Install",
    steps: [
      "Download hydrilla-unity.zip from this page and unzip it.",
      "Copy the Hydrilla folder into your project's Assets folder.",
      "In the menu bar, open Window > Hydrilla.",
      "Paste your API key, or click Run Bridge to receive models.",
    ],
  },
  "/integrations/unreal": {
    name: "Install",
    steps: [
      "Enable the Python Editor Script Plugin in Unreal, then restart the editor.",
      "Unzip the download and copy the contents of its Python folder into your project's Content/Python folder, then restart.",
      "Open the Hydrilla menu in the editor's main menu bar.",
      "Set your API key once from the Python console, then choose Run Bridge to receive models.",
    ],
  },
  "/integrations/godot": {
    name: "Install",
    steps: [
      "Download the plugin and copy addons/hydrilla into your Godot project.",
      "Open Project Settings > Plugins and enable the Hydrilla plugin.",
      "Open the Hydrilla dock and paste your API key.",
      "Generate from the dock, or click Run Bridge to receive models from Studio or your AI agent.",
    ],
  },
  "/integrations/mcp": {
    name: "Install",
    steps: [
      "Install Node.js 20 or newer. The server is the npm package hydrilla-mcp, started with npx -y hydrilla-mcp@latest.",
      "Add your API key in a Hydrilla plugin, or set HYDRILLA_API_KEY in the server's MCP config. Never paste it into the chat.",
      "Register the server in your MCP client with the command on this page, then restart the client.",
    ],
  },
};

function crumbs(path: string, name: string) {
  const crumbName = path === "/bluefox" ? "BlueFox" : path === "/water" ? "Water Agent" : name;
  const section = SECTION[path];
  const items = section
    ? [
        { name: section.name, path: section.path },
        { name: crumbName, path },
      ]
    : [{ name: crumbName, path }];
  const unique = items.filter((item, index) => items.findIndex((other) => other.path === item.path) === index);
  return {
    "@type": "BreadcrumbList",
    itemListElement: unique.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://hydrilla.ai${item.path}`,
    })),
  };
}

function howTo(id: string, name: string, steps: string[]) {
  return {
    "@type": "HowTo",
    "@id": id,
    name,
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}

function faq(id: string, pairs: Array<[string, string]>) {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: pairs.map(([question, text]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };
}

function offer(name: string, price: string, description: string) {
  return {
    "@type": "Offer",
    name,
    price,
    priceCurrency: "USD",
    description,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "USD",
      unitText: "MONTH",
    },
    url: "https://hydrilla.ai/pricing",
  };
}

const SERVED_REGIONS = [
  { "@type": "Country", name: "India", identifier: "IN" },
  { "@type": "Country", name: "United States", identifier: "US" },
  { "@type": "Country", name: "Japan", identifier: "JP" },
  { "@type": "Country", name: "China", identifier: "CN" },
  { "@type": "Country", name: "France", identifier: "FR" },
  { "@type": "Place", name: "Worldwide" },
];

export function getKitJsonLd(path: string) {
  const name = NAMES[path] || path;
  const pageType =
    path === "/about"
      ? "AboutPage"
      : path === "/contact"
        ? "ContactPage"
        : path === "/integrations" || path === "/solutions" || path === "/blog" || path === "/compare" || path === "/changelog"
          ? "CollectionPage"
          : "WebPage";
  const page = {
    "@type": pageType,
    "@id": `https://hydrilla.ai${path}#webpage`,
    url: `https://hydrilla.ai${path}`,
    name,
    isPartOf: { "@id": WEBSITE },
    ...(path === "/enterprise"
      ? {
          description:
            "Hydrilla Enterprise gives studios BlueFox, Water Agent, native 3D plugins for Blender, Unity, Unreal, and Godot, MCP server, and REST API concurrency.",
          about: { "@id": "https://hydrilla.ai/enterprise#software" },
          publisher: { "@id": ORG },
          inLanguage: "en-US",
        }
      : {}),
  };
  const nodes: object[] = [page, website, crumbs(path, name)];

  if (path === "/about" || path === "/brand") {
    const founders = TEAM_MEMBERS.slice(0, 3).map((member) => ({
      "@type": "Person",
      name: member.name,
      jobTitle: TEAM_ROLES[member.name] || member.role,
      image: member.image.startsWith("http") ? member.image : `https://hydrilla.ai${member.image}`,
      url: member.connect || `https://hydrilla.ai/team#${member.id}`,
      worksFor: { "@id": ORG },
      ...(member.connect ? { sameAs: [member.connect] } : {}),
    }));
    nodes.push({
      "@type": "Organization",
      "@id": ORG,
      name: "Hydrilla AI",
      alternateName: ["Hydrilla", "Hydrilla.ai"],
      url: "https://hydrilla.ai",
      description: "Hydrilla AI is an AI 3D workspace for studio and artist pipelines.",
      disambiguatingDescription: "AI 3D software company that builds the Hydrilla workspace and BlueFox, Hydrilla's 3D model",
      logo: "https://hydrilla.ai/hyd01-mark.png",
      founder: founders,
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
      foundingLocation: {
        "@type": "Place",
        name: "India",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
      },
      areaServed: SERVED_REGIONS,
      sameAs: [
        "https://x.com/hydrillaai",
        "https://www.linkedin.com/company/hydrilla-ai",
        "https://www.reddit.com/r/hydrilla",
        "https://www.instagram.com/hydrilla.ai",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "founders@hydrilla.ai",
        contactType: "customer support",
        areaServed: SERVED_REGIONS,
      },
      subOrganization: {
        "@id": "https://hydrilla.ai/research#lab",
      },
    });
  }
  if (path === "/features") nodes.push(software);
  if (path === "/bluefox") nodes.push(model);
  if (path === "/water") {
    nodes.push({
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/water#software",
      name: "Water Agent",
      alternateName: "Hydrilla Water Agent",
      description:
        "Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.",
      url: "https://hydrilla.ai/water",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      isPartOf: { "@id": SOFTWARE },
      provider: { "@id": ORG },
      featureList: [
        "Build 3D asset sets from a brief, in conversation",
        "Revise piece by piece",
        "Works inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Included on every Hydrilla plan, no credits",
      },
    });
    nodes.push(
      howTo("https://hydrilla.ai/water#howto", "From brief to finished set", [
        "Write the brief like a creative director: the pieces, the style, and where the assets will be used.",
        "Review the plan and adjust it until it matches your intent.",
        "Water Agent builds the set to the direction you gave it.",
        "Check each piece, ask for changes in the conversation, and take the finished set into your project.",
      ]),
    );
    nodes.push(
      faq("https://hydrilla.ai/water#faq", [
        ["What does Water Agent cost?", "Water Agent costs no credits and is included on every plan."],
        ["Who is it for?", "3D artists, art leads, and studio teams who brief whole sets of assets and need them to hold together."],
        ["Can a brief be a single asset?", "Yes. A brief can be one prop or a whole scene, and Water Agent plans only what you ask for."],
        [
          "When should I use text to 3D instead?",
          "When you already know the one model you want. Text to 3D starts from a prompt, and image to 3D starts from a reference.",
        ],
        [
          "How is Water Agent different from the MCP server?",
          "Water Agent is the agent inside Hydrilla. The MCP server lets your own AI agent drive Hydrilla from outside.",
        ],
      ]),
    );
  }
  if (path === "/pricing") {
    nodes.push({
      ...software,
      offers: [
        offer("Free", "0", "100 credits a month"),
        offer("Starter", "5", "900 credits a month"),
        offer("Pro", "12", "3,000 credits a month, REST API access"),
        offer("Hourly", "3", "900 credits a month, in one chosen hour a day"),
        offer("Hourly Pro", "8", "3,000 credits a month in a chosen daily window, 33% off Pro"),
      ],
    });
    nodes.push(
      faq("https://hydrilla.ai/pricing#faq", [
        ["What does a model cost?", "A model from text costs 45 credits and a model from an uploaded image costs 30, at default quality."],
        ["Do unused credits carry over?", "No. Allowances reset each billing month."],
        ["How does the 14-day trial work?", "Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card."],
        [
          "How do Hourly plans save?",
          "Hourly Pro gives Pro's 3,000 credits for 33% less, $8 instead of $12, in a chosen daily window. Hourly gives Starter's 900 credits for $3 instead of $5, in one chosen hour a day.",
        ],
        ["Which plan includes the API?", "Pro includes REST API access."],
      ]),
    );
  }
  if (path === "/enterprise") {
    nodes.push({
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/enterprise#software",
      name: "Hydrilla Enterprise",
      alternateName: "Hydrilla for Enterprise",
      description:
        "Enterprise AI 3D workspace, Water Agent AI 3D agent, native Blender, Maya, 3ds Max, Unity, Unreal Engine, and Godot 4 plugins, MCP server, and high-concurrency REST API for studio pipelines.",
      url: "https://hydrilla.ai/enterprise",
      applicationCategory: "DesignApplication",
      applicationSubCategory: "Enterprise AI 3D Workspace, AI Agent & Pipeline API",
      operatingSystem: "Web, Windows, macOS, Linux (Blender, Maya, 3ds Max, Unity, Unreal Engine, Godot 4)",
      publisher: { "@id": ORG },
      provider: { "@id": ORG },
      isPartOf: { "@id": SOFTWARE },
      featureList: [
        "Text to 3D and image to 3D with BlueFox, Hydrilla's 3D model",
        "Segmented 3D meshes with UVs and PBR texture maps",
        "Water Agent AI 3D agent included at zero credit cost",
        "Native AI 3D plugins and local Bridge for Blender, Maya, 3ds Max, Unity, Unreal Engine, and Godot 4",
        "Model Context Protocol (MCP) server for AI coding agents",
        "REST API with concurrency sized to studio volume",
        "Shared studio workspace, team seats, and custom credit pools",
        "Queue priority and dedicated pipeline onboarding",
        "Commercial IP ownership and zero model training on customer data",
      ],
      areaServed: SERVED_REGIONS,
    });
    nodes.push({
      "@type": "ContactPoint",
      "@id": "https://hydrilla.ai/enterprise#contact",
      contactType: "sales",
      email: "founders@hydrilla.ai",
      url: "https://cal.com/hydrilla",
      areaServed: SERVED_REGIONS,
      availableLanguage: ["English"],
    });
    nodes.push(
      faq(
        "https://hydrilla.ai/enterprise#faq",
        ENTERPRISE_FAQ.map(({ q, a }): [string, string] => [q, faqPlainText(a)]),
      ),
    );
  }
  if (path === "/faq") {
    nodes.push(
      faq("https://hydrilla.ai/faq#faq", [
        ["Do I own the 3D models I generate?", "Hydrilla's Terms of Service cover ownership of the 3D assets you generate. The ownership section of the Terms has the exact wording."],
        ["Can I upload reference images I didn't create?", "Only upload images you have the right to use. The Terms apply to everything you upload."],
        ["How do I sign in?", "You sign in to Studio with your Hydrilla account. How each plugin signs in is listed on integrations."],
        ["Can I delete my work or my account?", "To close your account or ask for its data to be deleted, write to founders@hydrilla.ai from your account email."],
        ["Where can I read how my data is handled?", "The Privacy Policy covers personal data. The security page covers model training, accounts, stored assets, and exports for studio reviewers."],
        ["How do I get help?", "Email founders@hydrilla.ai or use the contact form. For a generation problem, include your account email, the workspace, and a screenshot."],
        ["Where should I start if I'm new?", "Follow the steps in the docs, from sign-up to a first import in your own tools."],
      ]),
    );
  }
  if (path === "/research") {
    nodes.push({
      "@type": "ResearchOrganization",
      "@id": "https://hydrilla.ai/research#lab",
      name: "Hawan Research Labs",
      url: "https://hydrilla.ai/research",
      description: "Hawan Research Labs is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built.",
      parentOrganization: { "@id": ORG },
    });
    nodes.push({
      "@type": "TechArticle",
      "@id": "https://hydrilla.ai/research#model-card",
      headline: "BlueFox 1 model card",
      about: { "@id": "https://hydrilla.ai/bluefox#model" },
      author: { "@id": "https://hydrilla.ai/research#lab" },
      publisher: { "@id": ORG },
      url: "https://hydrilla.ai/research#model-card",
    });
  }
  if (path === "/api") {
    nodes.push({
      "@type": "WebAPI",
      "@id": "https://hydrilla.ai/api#webapi",
      name: "Hydrilla REST API",
      url: "https://hydrilla.ai/api",
      provider: { "@id": ORG },
    });
  }
  if (path === "/docs") {
    nodes.push({ "@type": "TechArticle", "@id": "https://hydrilla.ai/docs#article", headline: "Get started with Hydrilla", url: "https://hydrilla.ai/docs" });
    nodes.push(
      howTo("https://hydrilla.ai/docs#howto", "Your first export", [
        "Sign up, then open Studio.",
        "Create a workspace so a project's generations stay together.",
        "Generate: write a prompt in text to 3D, or drop a photo into image to 3D.",
        "Preview the model: orbit it and check parts and materials.",
        "Choose a format in the export menu and export.",
        "Import the file into Blender, Unity, Unreal, or Godot, or send it with a plugin.",
      ]),
    );
  }
  if (path === "/text-to-3d" || path === "/image-to-3d") {
    nodes.push(
      howTo(
        `https://hydrilla.ai${path}#howto`,
        path === "/text-to-3d" ? "Text to 3D with BlueFox" : "Image to 3D with BlueFox",
        path === "/text-to-3d"
          ? [
              "Write a prompt naming the subject, its style, and its use.",
              "An image model renders a reference, at Low or High quality, in a square, landscape, or portrait frame.",
              "Adjust the image with an Edit prompt until it looks right.",
              "Generate the 3D model, then preview it and export.",
            ]
          : [
              "Upload a picture of the object you want.",
              "Start the job, and the picture becomes a model split into parts.",
              "Spin it in the preview, check each part, then export.",
            ],
      ),
    );
  }
  if (path.startsWith("/integrations/") && path !== "/integrations/connect") {
    const pluginDetails: Record<
      string,
      {
        description: string;
        subCategory: string;
        requirements: string;
        downloadUrl?: string;
        featureList: string[];
      }
    > = {
      "/integrations/blender": {
        description:
          "The Hydrilla add-on for Blender generates 3D models from a prompt or image inside your scene with BlueFox, runs Water Agent inside Blender, and receives GLB models from Studio over the local Bridge.",
        subCategory: "Blender 3D Add-on",
        requirements: "Blender",
        downloadUrl: "https://hydrilla.ai/plugins/hydrilla-blender.zip",
        featureList: [
          "Generate 3D models from text or images in the Blender N-panel sidebar",
          "Direct whole 3D asset sets inside Blender with Water Agent",
          "Receive segmented GLB meshes with UVs and PBR maps from Studio via local Bridge",
          "Authenticate once with a Hydrilla API key; no browser sign-in",
        ],
      },
      "/integrations/unity": {
        description:
          "The Hydrilla plugin for Unity generates 3D models with BlueFox inside the Unity Editor, supports Water Agent workflows, and imports GLB assets into Assets/Hydrilla via the API or local Bridge.",
        subCategory: "Unity Editor 3D Plugin",
        requirements: "Unity Editor",
        downloadUrl: "https://hydrilla.ai/plugins/hydrilla-unity.zip",
        featureList: [
          "Generate 3D assets from Window > Hydrilla in Unity Editor",
          "Import segmented GLB models with PBR maps directly into Assets/Hydrilla",
          "Receive models from Studio or your AI agent over the local Bridge",
          "Works with Water Agent for multi-asset scene briefs",
        ],
      },
      "/integrations/unreal": {
        description:
          "The Hydrilla Python editor plugin for Unreal Engine runs BlueFox 3D generation from the toolbar and imports GLB meshes into Content/Hydrilla for the glTF importer.",
        subCategory: "Unreal Engine 3D Plugin",
        requirements: "Unreal Engine with Python Editor Script Plugin",
        downloadUrl: "https://hydrilla.ai/plugins/hydrilla-unreal.zip",
        featureList: [
          "Run text-to-3D and image-to-3D jobs from the Unreal Editor Python console",
          "Land GLB assets in Content/Hydrilla for Unreal's glTF importer",
          "Receive meshes from Hydrilla Studio over the local Bridge",
          "Works with Water Agent inside Unreal Engine",
        ],
      },
      "/integrations/godot": {
        description:
          "The Hydrilla editor dock plugin for Godot 4 generates GLB 3D models with BlueFox and receives Studio sends over the local Bridge into res://hydrilla/.",
        subCategory: "Godot 4 Editor Plugin",
        requirements: "Godot 4",
        downloadUrl: "https://hydrilla.ai/plugins/hydrilla-godot.zip",
        featureList: [
          "Godot 4 editor dock for prompt and image to 3D generation",
          "Native glTF / GLB import into res://hydrilla/",
          "Local Bridge listener for Hydrilla Studio sends",
          "Works with Water Agent inside Godot 4",
        ],
      },
      "/integrations/mcp": {
        description:
          "Hydrilla's local stdio MCP server lets Cursor, Claude Code, and other Model Context Protocol agents generate 3D models with BlueFox through the Hydrilla REST API.",
        subCategory: "Model Context Protocol (MCP) Server",
        requirements: "Node.js and an MCP client (Cursor, Claude Code, etc.)",
        downloadUrl: "https://www.npmjs.com/package/hydrilla-mcp",
        featureList: [
          "Local stdio Model Context Protocol server for 3D generation",
          "Submit text-to-3D and image-to-3D jobs from AI coding agents",
          "Poll task completion and send finished models into Blender, Unity, Unreal or Godot",
        ],
      },
    };
    const meta = pluginDetails[path];
    nodes.push({
      "@type": "SoftwareApplication",
      "@id": `https://hydrilla.ai${path}#software`,
      name,
      applicationCategory: "DesignApplication",
      ...(meta
        ? {
            applicationSubCategory: meta.subCategory,
            description: meta.description,
            operatingSystem: "Windows, macOS, Linux",
            softwareRequirements: meta.requirements,
            ...(meta.downloadUrl ? { downloadUrl: meta.downloadUrl } : {}),
            featureList: meta.featureList,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free plugin download; uses Hydrilla account or API key",
            },
          }
        : {}),
      url: `https://hydrilla.ai${path}`,
      publisher: { "@id": ORG },
      isPartOf: { "@id": SOFTWARE },
    });
    const install = INTEGRATION_HOWTO[path];
    if (install) {
      nodes.push(howTo(`https://hydrilla.ai${path}#howto`, install.name, install.steps));
    }
    if (path === "/integrations/blender") {
      nodes.push(
        faq("https://hydrilla.ai/integrations/blender#faq", [
          [
            "The add-on says my key was not accepted.",
            "Create a new key under API keys, paste it into the Hydrilla tab, and choose Check. The add-on uses an API key, so there is no browser sign-in to keep open.",
          ],
          [
            "Nothing arrives when I send from Studio.",
            "Check that Run Bridge is active in the Hydrilla panel and Blender is open on a scene, then send again. Formats other than GLB are covered on exports.",
          ],
          [
            "The model looks too small or too large.",
            "Blender works in meters with Z up. Check the units table before you scale anything by hand.",
          ],
        ]),
      );
    }
  }
  if (path === "/integrations") {
    const items = [
      {
        path: "/integrations/blender",
        name: "Hydrilla for Blender (AI 3D Add-on)",
        description: "Generation in a Blender N-panel sidebar tab, Water Agent support, plus Studio sends over the local Bridge.",
      },
      {
        path: "/integrations/unity",
        name: "Hydrilla for Unity (AI 3D Editor Plugin)",
        description: "Generation and GLB import inside the Unity Editor into Assets/Hydrilla.",
      },
      {
        path: "/integrations/unreal",
        name: "Hydrilla for Unreal Engine (AI 3D Python Plugin)",
        description: "A Python editor plugin for generation and GLB import into Content/Hydrilla.",
      },
      {
        path: "/integrations/godot",
        name: "Hydrilla for Godot 4 (AI 3D Editor Dock)",
        description: "A Godot 4 editor dock that generates and receives GLB models into res://hydrilla/.",
      },
      {
        path: "/integrations/mcp",
        name: "Hydrilla MCP Server (Model Context Protocol for 3D)",
        description: "Local stdio MCP server for Cursor, Claude Code, and any MCP client.",
      },
      {
        path: "/api",
        name: "Hydrilla REST API",
        description: "Text-to-3D and image-to-3D generation jobs from your own code.",
      },
    ];
    nodes.push({
      "@type": "ItemList",
      "@id": "https://hydrilla.ai/integrations#list",
      name: "Hydrilla AI 3D Plugins and Integrations",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        description: item.description,
        url: `https://hydrilla.ai${item.path}`,
      })),
    });
    nodes.push(
      howTo("https://hydrilla.ai/integrations#howto", "From Studio to your open scene with the local Bridge", [
        "Click Run Bridge in the Hydrilla plugin inside Blender, Unity, Unreal Engine, or Godot 4.",
        "Generate or select a 3D model in Hydrilla Studio in your browser.",
        "Use Send to DCC in Studio so the mesh arrives directly in your open scene.",
      ]),
    );
  }
  if (path === "/solutions") {
    nodes.push({
      "@type": "ItemList",
      itemListElement: ["/solutions/games", "/solutions/film", "/solutions/architecture", "/solutions/xr", "/solutions/product"].map(
        (item, index) => ({ "@type": "ListItem", position: index + 1, url: `https://hydrilla.ai${item}` }),
      ),
    });
  }
  if (path === "/blog") {
    nodes.push({
      "@type": "ItemList",
      itemListElement: ["/blog/import-ai-meshes", "/blog/reference-images"].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://hydrilla.ai${item}`,
      })),
    });
  }
  if (path === "/compare") {
    nodes.push({
      "@type": "ItemList",
      itemListElement: [
        "/compare/meshy",
        "/compare/tripo",
        "/compare/hyper3d",
        "/compare/trellis",
        "/compare/sloyd",
        "/compare/how-to-choose",
      ].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://hydrilla.ai${item}`,
      })),
    });
  }
  if (path === "/changelog") {
    nodes.push({
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "19 Aug 2026: BlueFox 1 in Studio", url: "https://hydrilla.ai/bluefox" },
        { "@type": "ListItem", position: 2, name: "19 Aug 2026: REST API", url: "https://hydrilla.ai/api" },
        { "@type": "ListItem", position: 3, name: "19 Aug 2026: Docs, FAQ, and pipeline notes", url: "https://hydrilla.ai/docs" },
      ],
    });
  }
  if (path === "/team") {
    for (const member of TEAM_MEMBERS) {
      nodes.push({
        "@type": "Person",
        name: member.name,
        jobTitle: TEAM_ROLES[member.name] || member.role,
        image: member.image.startsWith("http") ? member.image : `https://hydrilla.ai${member.image}`,
        url: `https://hydrilla.ai/team#${member.id}`,
        worksFor: { "@id": ORG },
        ...(member.connect ? { sameAs: [member.connect] } : {}),
      });
    }
  }
  if (path === "/blog/reference-images" || path === "/blog/import-ai-meshes") {
    nodes.push({
      "@type": "Article",
      "@id": `https://hydrilla.ai${path}#article`,
      headline: path === "/blog/reference-images" ? "What makes a good reference image for image to 3D?" : "How do you import an AI-generated mesh into a game engine?",
      datePublished: "2026-10-24",
      dateModified: "2026-10-24",
      author: { "@id": ORG },
      publisher: { "@id": ORG },
      url: `https://hydrilla.ai${path}`,
    });
  }
  if (path.startsWith("/compare/")) {
    const about =
      path === "/compare/meshy"
        ? { name: "Meshy", sameAs: "https://www.meshy.ai" }
        : path === "/compare/tripo"
          ? { name: "Tripo", sameAs: "https://www.tripo3d.ai" }
          : path === "/compare/hyper3d"
            ? { name: "Hyper3D", sameAs: "https://hyper3d.ai" }
            : path === "/compare/trellis"
              ? { name: "Trellis", sameAs: "https://github.com/microsoft/TRELLIS" }
              : path === "/compare/sloyd"
                ? { name: "Sloyd", sameAs: "https://www.sloyd.ai" }
                : null;
    nodes.push({
      "@type": "Article",
      "@id": `https://hydrilla.ai${path}#article`,
      headline: name,
      author: { "@id": ORG },
      publisher: { "@id": ORG },
      datePublished: "2026-10-24",
      dateModified: "2026-10-24",
      url: `https://hydrilla.ai${path}`,
      ...(about ? { about: { "@type": "Thing", name: about.name, sameAs: about.sameAs } } : {}),
    });
    if (path === "/compare/how-to-choose") {
      nodes.push(
        howTo("https://hydrilla.ai/compare/how-to-choose#howto", "Run a fair bake-off", [
          "Write one brief with three assets taken from a real task.",
          "Generate each asset in every tool with identical inputs.",
          "Import the results into your scene, under your own lighting.",
          "Score each criterion, then log the cleanup time per asset.",
        ]),
      );
    }
  }

  return { "@context": "https://schema.org", "@graph": nodes };
}
