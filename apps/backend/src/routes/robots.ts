import type { Request, Response } from "express";

// Crawlers rendering community pages were downloading every model (20-50 MB each)
// through the mesh routes, which Vercel bills as Fast Origin Transfer. Search engines
// gain nothing from mesh or preview-proxy bytes, so keep them off those routes.
const ROBOTS_TXT = [
  "User-agent: *",
  "Disallow: /api/3d/glb/",
  "Disallow: /api/3d/image-proxy",
  "",
].join("\n");

export function robotsTxt(_req: Request, res: Response) {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Vercel-CDN-Cache-Control", "max-age=86400");
  res.type("text/plain").send(ROBOTS_TXT);
}
