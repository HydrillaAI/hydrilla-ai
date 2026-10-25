#!/usr/bin/env node
/**
 * Phase 02 Redirect & Route Verification Script
 * Uses Node built-ins only (`fetch` with `redirect: "manual"`).
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

const PENDING_TARGETS = new Map([
  ["/water", "pending phase 04"],
  ["/water.md", "pending phase 04/07"],
  ["/text-to-3d", "pending phase 04"],
  ["/text-to-3d.md", "pending phase 04/07"],
  ["/image-to-3d", "pending phase 04"],
  ["/image-to-3d.md", "pending phase 04/07"],
  ["/compare/hyper3d", "pending phase 06"],
  ["/compare/hyper3d.md", "pending phase 06/07"],
  ["/compare/how-to-choose", "pending phase 06"],
  ["/compare/how-to-choose.md", "pending phase 06/07"],
  ["/blog/reference-images", "pending phase 06"],
  ["/blog/reference-images.md", "pending phase 06/07"],
  ["/blog/import-ai-meshes", "pending phase 06"],
  ["/blog/import-ai-meshes.md", "pending phase 06/07"],
  ["/integrations/unity.md", "pending phase 07"],
  ["/integrations/unreal.md", "pending phase 07"],
  ["/integrations/blender.md", "pending phase 07"],
  ["/solutions.md", "pending phase 07"],
  ["/solutions/games.md", "pending phase 07"],
  ["/solutions/film.md", "pending phase 07"],
  ["/solutions/architecture.md", "pending phase 07"],
  ["/solutions/xr.md", "pending phase 07"],
  ["/solutions/product.md", "pending phase 07"],
  ["/bluefox.md", "pending phase 07"],
  ["/privacy.md", "pending phase 07"],
  ["/terms.md", "pending phase 07"],
  ["/cookies.md", "pending phase 07"],
]);

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

const PATTERN_TESTS = [
  ["/blog/category/bluefox", "/blog"],
  ["/blog/category/bluefox/", "/blog"],
  ["/blog/category/bluefox.md", "/blog.md"],
  ["/blog/category/bluefox/page/2", "/blog"],
  ["/blog/page/2", "/blog"],
  ["/blog/page/2/", "/blog"],
  ["/blog/page/2.md", "/blog.md"],
  ["/blog?category=bluefox", "/blog"],
  ["/blog?page=2", "/blog"],
];

const LIVE_RENAMED_ROUTES = [
  "/bluefox",
  "/solutions",
  "/solutions/games",
  "/solutions/film",
  "/solutions/architecture",
  "/solutions/xr",
  "/solutions/product",
  "/compare/meshy",
  "/compare/tripo",
  "/privacy",
  "/terms",
  "/cookies",
];

function normalizeLocation(loc) {
  if (!loc) return "";
  try {
    const u = new URL(loc, BASE);
    return u.pathname + u.search;
  } catch {
    return loc;
  }
}

async function checkOneRedirect(source, expectedTarget) {
  const res = await fetch(`${BASE}${source}`, { redirect: "manual" });
  const status = res.status;
  const rawLoc = res.headers.get("location") || "";
  const loc = normalizeLocation(rawLoc);

  let targetStatus = "-";
  let note = "";
  if (loc) {
    const targetRes = await fetch(`${BASE}${loc}`, { redirect: "manual" });
    targetStatus = String(targetRes.status);
    if (targetRes.status >= 300 && targetRes.status < 400) {
      note = `CHAIN! -> ${targetRes.headers.get("location")}`;
    } else if (targetRes.status === 404 && PENDING_TARGETS.has(loc)) {
      note = PENDING_TARGETS.get(loc);
    }
  }

  const ok =
    status === 301 &&
    loc === expectedTarget &&
    (targetStatus === "200" || PENDING_TARGETS.has(loc));

  return { source, status, loc, expectedTarget, targetStatus, note, ok };
}

async function main() {
  const tests = [];
  for (const [src, dst] of REDIRECT_PAIRS) {
    tests.push([src, dst]);
    tests.push([`${src}/`, dst]);
    tests.push([`${src}.md`, `${dst}.md`]);
  }
  for (const [src, dst] of PATTERN_TESTS) {
    tests.push([src, dst]);
  }

  let failures = 0;
  console.log("=== LIVE RENAMED ROUTES (expect 200) ===");
  for (const route of LIVE_RENAMED_ROUTES) {
    const res = await fetch(`${BASE}${route}`, { redirect: "manual" });
    const pass = res.status === 200;
    if (!pass) failures++;
    console.log(`${pass ? "PASS" : "FAIL"} | ${route} -> ${res.status}`);
  }

  console.log("\n=== REDIRECT CHECKS (source -> status -> Location -> targetStatus) ===");
  for (const [src, dst] of tests) {
    const r = await checkOneRedirect(src, dst);
    if (!r.ok) failures++;
    const extra = r.note ? ` (${r.note})` : "";
    console.log(
      `${r.ok ? "PASS" : "FAIL"} | ${r.source} -> ${r.status} -> ${r.loc} [expected ${r.expectedTarget}] -> ${r.targetStatus}${extra}`
    );
  }

  console.log(`\nSummary: ${tests.length + LIVE_RENAMED_ROUTES.length} checks, ${failures} failures.`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
