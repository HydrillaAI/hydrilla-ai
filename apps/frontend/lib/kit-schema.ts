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
  "/water": "Water Agent: BYOK AI 3D Agent for Artists & Studios",
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
  "/enterprise": "Enterprise: AI 3D for Studio Pipelines",
  "/docs": "Docs: Get Started with Hydrilla AI 3D",
  "/faq": "Hydrilla FAQ: Licensing, Accounts, and Support",
  "/blog": "Hydrilla Blog: Guides for AI 3D Workflows",
  "/blog/reference-images": "Reference Images for Image to 3D: A Guide",
  "/blog/import-ai-meshes": "Import AI 3D Meshes into Unity, Unreal, Godot",
  "/changelog": "Hydrilla Changelog: AI 3D Product Updates",
  "/compare": "Compare Hydrilla with Meshy, Tripo, Hyper3D",
  "/compare/meshy": "Hydrilla vs Meshy: AI 3D Tools Side by Side",
  "/compare/tripo": "Hydrilla vs Tripo: Inputs, Exports, and API",
  "/compare/hyper3d": "Hydrilla vs Hyper3D Rodin: Facts Side by Side",
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
  "/compare/how-to-choose": { name: "Resources", path: "/docs" },
  "/about": { name: "Company", path: "/about" },
  "/research": { name: "Company", path: "/about" },
  "/team": { name: "Company", path: "/about" },
  "/careers": { name: "Company", path: "/about" },
  "/contact": { name: "Company", path: "/about" },
  "/security": { name: "Company", path: "/about" },
};

const TEAM_ROLES: Record<string, string> = {
  "Tharak Nagaveti": "Co-Founder",
  "Dharani Kumar": "Co-Founder and CTO",
  "Tejesh Varma": "Co-Founder and CGO",
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
      "In the menu bar, open Window > Hydrilla > Generate 3D.",
      "Paste your hyd_live_ API key, or start the Bridge to receive models.",
    ],
  },
  "/integrations/unreal": {
    name: "Install",
    steps: [
      "Enable the Python Editor Script Plugin in Unreal, then restart the editor.",
      "Unzip the download and place its Hydrilla folder in Content/Python or Plugins.",
      "Open the Hydrilla actions from the editor toolbar.",
      "Set your API key there, or switch on the Bridge listener.",
    ],
  },
  "/integrations/godot": {
    name: "Install",
    steps: [
      "Download the plugin and copy addons/hydrilla into your Godot project.",
      "Open Project Settings > Plugins and enable the Hydrilla plugin.",
      "Open the Hydrilla dock and add your hyd_live_ key.",
      "Generate from the dock, or listen on the Bridge for Studio sends.",
    ],
  },
  "/integrations/mcp": {
    name: "Install",
    steps: [
      "Download the MCP package, hydrilla-mcp.zip, from this page.",
      "Set HYDRILLA_API_KEY to your hyd_live_ key in the server's environment.",
      "Register the server in your MCP client, following the integration guide, then restart the client.",
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
  };
  const nodes: object[] = [page, website, crumbs(path, name)];

  if (path === "/about") {
    nodes.push({
      "@type": "Organization",
      "@id": ORG,
      name: "Hydrilla AI",
      alternateName: "Hydrilla",
      url: "https://hydrilla.ai",
      description: "Hydrilla AI is an AI 3D workspace for studio and artist pipelines.",
      disambiguatingDescription: "AI 3D software company that builds the Hydrilla workspace and BlueFox, Hydrilla's 3D model",
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
        "Hydrilla Water Agent is a BYOK AI 3D agent that turns a brief into procedural Three.js with multi-pass planning, preview, refine, and export.",
      url: "https://hydrilla.ai/water",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      isPartOf: { "@id": SOFTWARE },
      provider: { "@id": ORG },
      featureList: [
        "Plan a sculpt from a text brief and optional reference image",
        "Multi-pass build with Fast, Standard, and Studio quality tiers",
        "Preview a TypeScript Three.js factory in the browser sandbox",
        "Refine via director chat, then export GLB, GLTF, OBJ, STL, PNG, or .ts",
        "Zero Hydrilla credits with bring-your-own LLM key",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Included on every Hydrilla plan; uses your LLM provider key, no Hydrilla credits",
      },
    });
    nodes.push(
      howTo("https://hydrilla.ai/water#howto", "From brief to export with Water Agent", [
        "Write a brief with optional reference image, pick a BYOK model, and choose Fast, Standard, or Studio quality.",
        "Review the sculpt plan before generation continues.",
        "Water Agent builds through unlocked passes for the selected quality tier.",
        "Preview the TypeScript createModel() factory in the browser sandbox.",
        "Refine with director chat for scene edits or a rebuild child job.",
        "Export GLB, GLTF, OBJ, STL, PNG, or the .ts source into your project.",
      ]),
    );
    nodes.push(
      faq("https://hydrilla.ai/water#faq", [
        [
          "What does Water Agent cost?",
          "Water Agent costs no Hydrilla credits and is included on every plan. You bring your own LLM API key; that provider bills usage.",
        ],
        [
          "Who is it for?",
          "3D artists, art leads, game developers, and studio teams who want directed, multi-pass procedural assets they can preview and refine in conversation.",
        ],
        [
          "Can a brief be a single asset?",
          "Yes. A brief can be one prop or a character. The planner scopes only what you ask for.",
        ],
        [
          "When should I use text to 3D instead?",
          "When you want a Cloud mesh from a single prompt. Text to 3D and image to 3D use BlueFox. Water is the BYOK code-sculpt agent.",
        ],
        [
          "How is Water Agent different from the MCP server?",
          "Water Agent is the in-app agent inside Hydrilla workspace. The MCP server lets your own AI agent drive Hydrilla from outside.",
        ],
        [
          "Which skill packs are fully live?",
          "Object Studio and Character are live. Animation Ready and Game Ready are partial. Environment and World are not selectable yet.",
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
      "@type": "ContactPoint",
      "@id": "https://hydrilla.ai/enterprise#contact",
      contactType: "sales",
      email: "founders@hydrilla.ai",
      url: "https://cal.com/hydrilla",
    });
    nodes.push(
      faq("https://hydrilla.ai/enterprise#faq", [
        ["How is our data handled?", "Your data isn't used to train our models, on any plan. Generated assets are kept to your own workspace, and the security page explains both."],
        ["Can we send a security questionnaire?", "Yes. Send it to founders@hydrilla.ai, naming your studio and when you need answers. We answer in writing with what we can confirm."],
      ]),
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
    nodes.push({
      "@type": "SoftwareApplication",
      "@id": `https://hydrilla.ai${path}#software`,
      name,
      applicationCategory: "DeveloperApplication",
      url: `https://hydrilla.ai${path}`,
      publisher: { "@id": ORG },
      isPartOf: { "@id": SOFTWARE },
    });
    const install = INTEGRATION_HOWTO[path];
    if (install) {
      nodes.push(howTo(`https://hydrilla.ai${path}#howto`, install.name, install.steps));
    }
  }
  if (path === "/integrations") {
    nodes.push({
      "@type": "ItemList",
      itemListElement: [
        "/integrations/blender",
        "/integrations/unity",
        "/integrations/unreal",
        "/integrations/godot",
        "/integrations/mcp",
        "/api",
      ].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://hydrilla.ai${item}`,
      })),
    });
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
      itemListElement: ["/compare/meshy", "/compare/tripo", "/compare/hyper3d", "/compare/how-to-choose"].map((item, index) => ({
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
        image: `https://hydrilla.ai${member.image}`,
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
  }

  return { "@context": "https://schema.org", "@graph": nodes };
}
