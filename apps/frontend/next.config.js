/** @type {import('next').NextConfig} */

const REDIRECT_PAIRS = [
  ["/bluefox3d", "/bluefox"],
  ["/bluefox-3d", "/bluefox"],
  ["/3d-ai", "/bluefox"],
  ["/science-technology", "/bluefox"],
  ["/models", "/bluefox"],
  ["/usecase", "/solutions"],
  ["/usecase/gamedev", "/solutions/games"],
  ["/usecase/filmproduction", "/solutions/film"],
  ["/usecase/architecture", "/solutions/architecture"],
  ["/usecase/arvr", "/solutions/xr"],
  ["/usecase/productdesign", "/solutions/product"],
  ["/case-study", "/solutions"],
  ["/blog/text-to-3d", "/text-to-3d"],
  ["/blog/image-to-3d", "/image-to-3d"],
  ["/blog/export-formats", "/features"],
  ["/blog/hydrilla-for-unity", "/integrations/unity"],
  ["/blog/hydrilla-for-unreal", "/integrations/unreal"],
  ["/blog/hydrilla-for-blender", "/integrations/blender"],
  ["/blog/hydrilla-pricing-explained", "/pricing"],
  ["/blog/how-bluefox-works", "/bluefox"],
  ["/compare/hydrilla-vs-meshy", "/compare/meshy"],
  ["/compare/hydrilla-vs-tripo", "/compare/tripo"],
  ["/compare/hydrilla-vs-luma", "/compare"],
  ["/compare/best-ai-3d-generators", "/compare/how-to-choose"],
  ["/integrations/api", "/api"],
  ["/privacy-policy", "/privacy"],
  ["/terms-and-conditions", "/terms"],
  ["/cookie-policy", "/cookies"],
  ["/hawan", "/research"],
  ["/roadmap", "/changelog"],
  ["/earlyaccess", "/pricing"],
];

const nextConfig = {
  // Disable Next's automatic 308 trailing-slash redirect so explicit 301 rules
  // in `redirects()` fire in a single hop for both `/path` and `/path/`.
  skipTrailingSlashRedirect: true,
  transpilePackages: ["dialkit"],
  // Monorepo root: pnpm links dependencies from the root node_modules/.pnpm
  turbopack: {
    root: require("path").join(__dirname, "../.."),
  },
  // Skew protection (stale Server Action IDs after deploy):
  // 1. Enable in Vercel → Project → Settings → Advanced → Skew Protection
  // 2. Optionally set build+runtime env NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
  //    (`openssl rand -base64 32`) so action encryption stays stable across builds.
  // https://nextjs.org/docs/messages/failed-to-find-server-action
  // https://vercel.com/docs/skew-protection
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.tencentcos.cn" },
      { protocol: "https", hostname: "**.myqcloud.com" },
      { protocol: "https", hostname: "hydrilla-outputs-1.s3.amazonaws.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
    // Cap sizes to avoid "Array buffer allocation failed" (sharp allocates less memory)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Redirect /generate → /workspace so we never compile the heavy generate page on direct hit
  async redirects() {
    const seoRedirects = REDIRECT_PAIRS.flatMap(([source, destination]) => [
      { source, destination, statusCode: 301 },
      { source: `${source}/`, destination, statusCode: 301 },
      { source: `${source}.md`, destination: `${destination}.md`, statusCode: 301 },
    ]);

    return [
      { source: "/generate", destination: "/workspace", permanent: false },
      { source: "/generate/", destination: "/workspace", permanent: false },
      ...seoRedirects,
      // Blog categories and pagination cut → /blog (and .md variants → /blog.md)
      { source: "/blog/category/:any*.md", destination: "/blog.md", statusCode: 301 },
      { source: "/blog/category/:any*", destination: "/blog", statusCode: 301 },
      { source: "/blog/category/:any*/", destination: "/blog", statusCode: 301 },
      { source: "/blog/page/:n.md", destination: "/blog.md", statusCode: 301 },
      { source: "/blog/page/:n", destination: "/blog", statusCode: 301 },
      { source: "/blog/page/:n/", destination: "/blog", statusCode: 301 },
      // Profiles: /@name is canonical; /u/name is the internal route.
      { source: "/@:username([A-Za-z0-9._]{3,30})/", destination: "/@:username", statusCode: 301 },
      { source: "/u/:username", destination: "/@:username", statusCode: 301 },
      { source: "/u/:username/", destination: "/@:username", statusCode: 301 },
    ];
  },
  async rewrites() {
    return [
      // Public profiles live at /@username; a folder named "@..." would be a parallel-route slot.
      // Must precede the .md rules, which would otherwise read "/@name.md"-style paths as files.
      { source: "/@:username([A-Za-z0-9._]{3,30})", destination: "/u/:username" },
      { source: "/index.md", destination: "/markdown-mirror/index" },
      { source: "/:file.md", destination: "/markdown-mirror/:file" },
      { source: "/:dir/:file.md", destination: "/markdown-mirror/:dir/:file" },
      { source: "/:dir/:subdir/:file.md", destination: "/markdown-mirror/:dir/:subdir/:file" },
    ];
  },
  // Caching headers: only static assets get long cache; documents stay fresh for Core Web Vitals
  async headers() {
    return [
      {
        // Marketing home — allow CDN to reuse prerender briefly (pairs with revalidate on page).
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/blog",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/blog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // Do not set Cache-Control on /_next/static — Next.js owns those headers.
      // A custom immutable max-age breaks webpack HMR in dev (stale client chunks)
      // and causes hydration / Server Action mismatches after code changes.
      {
        // Allow CDN/browser to cache images in common paths
        source: "/3d-images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/herohydrillasrc.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/herohydrilla.mp4",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/llms.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
      {
        source: "/llms-full.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

module.exports = nextConfig;
