const routes = [
  "/features","/bluefox","/water","/text-to-3d","/image-to-3d",
  "/integrations","/integrations/blender","/integrations/unity","/integrations/unreal","/integrations/godot","/integrations/mcp",
  "/api","/pricing","/solutions","/solutions/games","/solutions/film","/solutions/architecture","/solutions/xr","/solutions/product",
  "/enterprise","/docs","/faq","/blog","/blog/reference-images","/blog/import-ai-meshes","/changelog",
  "/compare","/compare/meshy","/compare/tripo","/compare/hyper3d","/compare/how-to-choose",
  "/about","/research","/team","/careers","/contact","/security","/privacy","/terms","/cookies",
];
const base = process.argv[2] || "http://127.0.0.1:3010";

let failed = 0;
for (const route of routes) {
  const res = await fetch(base + route);
  const html = await res.text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  const types = new Set();
  let parsed = true;
  for (const block of blocks) {
    try {
      const data = JSON.parse(block);
      const nodes = data["@graph"] || [data];
      for (const node of nodes) {
        const type = node["@type"];
        if (Array.isArray(type)) type.forEach((item) => types.add(item));
        else if (type) types.add(type);
        if (node.parentOrganization && String(node["@id"] || "").includes("#organization") && node["@type"] === "Organization") {
          console.log("FAIL lab-parent", route);
          failed += 1;
        }
      }
    } catch (error) {
      parsed = false;
      console.log("FAIL parse", route, error.message);
      failed += 1;
    }
  }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || "";
  const md = await fetch(base + (route === "/" ? "/index.md" : route + ".md"), { redirect: "manual" });
  const link = md.headers.get("link") || "";
  const alternate = html.includes('type="text/markdown"');
  const ok = res.status === 200 && title.endsWith("| Hydrilla AI") && !title.includes("| Hydrilla AI |") && canonical === `https://hydrilla.ai${route}` && parsed && blocks.length > 0 && md.status === 200 && link.includes("rel=\"canonical\"") && alternate;
  if (!ok) {
    failed += 1;
    console.log("FAIL", route, { status: res.status, title, canonical, jsonld: blocks.length, md: md.status, link, alternate, parsed });
  } else {
    console.log("ok", route, [...types].join(","));
  }
}

const mdDirect = await fetch(base + "/md/features", { redirect: "manual" });
console.log("/md/features", mdDirect.status);
if (mdDirect.status === 200) failed += 1;
console.log(failed === 0 ? "ALL PASS" : `FAILURES ${failed}`);
process.exit(failed === 0 ? 0 : 1);
