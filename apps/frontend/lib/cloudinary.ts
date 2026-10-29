/** Cloudinary delivery helpers — f_webp for explicit WebP delivery. */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqizbxc9e";

export const CLOUDINARY_IMAGE_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_VIDEO_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;
export const CLOUDINARY_RAW_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

const VERSION = "v1";

export function cloudinaryImage(
  publicId: string,
  transform = "f_webp,q_auto"
): string {
  return `${CLOUDINARY_IMAGE_BASE}/${transform}/${VERSION}/${publicId}`;
}

export function cloudinaryVideo(
  publicId: string,
  transform = "q_auto"
): string {
  return `${CLOUDINARY_VIDEO_BASE}/${transform}/${VERSION}/${publicId}`;
}

/**
 * next/image loader for Cloudinary delivery URLs (images and video posters).
 * Rewrites `w_` (and `h_`, keeping the aspect) in the transform so `srcSet` serves
 * phones a small file. Never wider than the authored width, so desktop is unchanged.
 * Pass as `loader` instead of `unoptimized`.
 */
export function cloudinaryLoader({ src, width }: { src: string; width: number }): string {
  const match = src.match(/^(.*\/(?:image|video)\/upload\/)([^/]+)(\/.+)$/);
  if (!match) return src;
  const [, base, transform, rest] = match;
  const parts = transform.split(",");
  const authoredWidth = Number(parts.find((part) => part.startsWith("w_"))?.slice(2));
  if (!authoredWidth) return src;
  const nextWidth = Math.min(width, authoredWidth);
  const scale = nextWidth / authoredWidth;
  const rewritten = parts.map((part) => {
    if (part.startsWith("w_")) return `w_${nextWidth}`;
    const height = part.startsWith("h_") ? Number(part.slice(2)) : 0;
    return height ? `h_${Math.round(height * scale)}` : part;
  });
  return `${base}${rewritten.join(",")}${rest}`;
}

/** Raw files (GLB). No image transforms — the CDN caches the original bytes. */
export function cloudinaryRaw(publicId: string): string {
  return `${CLOUDINARY_RAW_BASE}/${publicId}`;
}

export const HERO_STAGE_MODELS = [
  cloudinaryRaw("v1791059174/hydrilla-landing/hero/stage-a.glb"),
  cloudinaryRaw("v1791059175/hydrilla-landing/hero/stage-b.glb"),
  cloudinaryRaw("v1792555678/hydrilla-landing/hero/stage-c.glb"),
  cloudinaryRaw("v1792555680/hydrilla-landing/hero/stage-d.glb"),
  cloudinaryRaw("v1792555680/hydrilla-landing/hero/stage-e.glb"),
  cloudinaryRaw("v1792555681/hydrilla-landing/hero/stage-f.glb"),
  cloudinaryRaw("v1792555682/hydrilla-landing/hero/stage-g.glb"),
  cloudinaryRaw("v1792555683/hydrilla-landing/hero/stage-h.glb"),
  cloudinaryRaw("v1792555684/hydrilla-landing/hero/stage-i.glb"),
  cloudinaryRaw("v1792555685/hydrilla-landing/hero/stage-j.glb"),
] as const;

/**
 * Closing CTA puppets, left to right. Simplified to ~150k triangles,
 * 768px WebP textures and Meshopt (`-cc`), so each is 0.7–1.7 MB.
 */
export const CTA_PUPPET_MODELS = {
  antMan: cloudinaryRaw("v1792870570/hydrilla-landing/cta/puppet-a.glb"),
  mantis: cloudinaryRaw("v1792870571/hydrilla-landing/cta/puppet-b.glb"),
  lantern: cloudinaryRaw("v1792870572/hydrilla-landing/cta/puppet-c.glb"),
  witch: cloudinaryRaw("v1792870573/hydrilla-landing/cta/puppet-d.glb"),
  deadpool: cloudinaryRaw("v1792870574/hydrilla-landing/cta/puppet-e.glb"),
} as const;

/** 404 grass field. Served from the original uncompressed model in /public. */
export const NOT_FOUND_GRASS_URL = "/notfound-3d/simple_grass_chunks.glb";

/** Full-viewport hero poster (WebP). */
export const HERO_POSTER_URL = cloudinaryImage(
  "hydrilla-landing/hero/poster",
  "f_webp,q_auto:eco,c_fill,w_1600,h_900"
);

/** Preload-sized hero poster for faster LCP (eco quality, capped width). */
export const HERO_POSTER_PRELOAD_URL = cloudinaryImage(
  "hydrilla-landing/hero/poster",
  "f_webp,q_auto:eco,c_fill,w_1280,h_720"
);

/** Hero background video — deferred after idle in Hero.tsx. */
export const HERO_VIDEO_URL = cloudinaryVideo("hydrilla-landing/hero/backdrop");

/** Use-case hero card images (WebP). */
export function usecaseHeroImage(
  id: string,
  transform = "f_webp,q_auto,c_fit,w_840,h_1050"
): string {
  return cloudinaryImage(`hydrilla-landing/usecase/${id}`, transform);
}

export const USECASE_HERO = {
  games: usecaseHeroImage("games"),
  films: usecaseHeroImage("films"),
  archi: usecaseHeroImage("archi"),
  prod: usecaseHeroImage("prod"),
  arvr3: usecaseHeroImage("arvr3"),
  arvrxr: usecaseHeroImage("arvrxr"),
  arvrxr2: usecaseHeroImage("arvrxr2"),
} as const;

/** Why Hydrilla bento media (WebP posters + optimized video). */
const WHY_FOLDER = "hydrilla-landing/why-hydrilla";

export function whyHydrillaImage(
  id: string,
  transform = "f_webp,q_auto,c_fill,w_1200"
): string {
  return cloudinaryImage(`${WHY_FOLDER}/${id}`, transform);
}

export function whyHydrillaVideo(
  id: string,
  transform = "q_auto,vc_auto"
): string {
  return cloudinaryVideo(`${WHY_FOLDER}/${id}`, transform);
}

/** First-frame WebP poster from a Why Hydrilla video. */
export function whyHydrillaVideoPoster(
  id: string,
  transform = "so_0,f_webp,q_auto,c_fill,w_1200"
): string {
  return `${CLOUDINARY_VIDEO_BASE}/${transform}/${VERSION}/${WHY_FOLDER}/${id}`;
}

export const WHY_HYDRILLA_MEDIA = {
  bluefox: {
    video: whyHydrillaVideo("bluefox-why"),
    poster: whyHydrillaVideoPoster("bluefox-why", "so_0,f_webp,q_auto,c_fill,w_1600"),
  },
  fast: {
    video: whyHydrillaVideo("fast-why"),
    poster: whyHydrillaVideoPoster("fast-why"),
  },
  threeD: {
    video: whyHydrillaVideo("3d-why"),
    poster: whyHydrillaVideoPoster("3d-why"),
  },
  multi: {
    video: whyHydrillaVideo("multi-why"),
    poster: whyHydrillaVideoPoster("multi-why"),
  },
  rockey: {
    video: whyHydrillaVideo("rockey-why"),
    poster: whyHydrillaVideoPoster("rockey-why"),
  },
  tenX: {
    video: whyHydrillaVideo("10x-why"),
    poster: whyHydrillaVideoPoster("10x-why"),
  },
  assets: {
    video: whyHydrillaVideo("3d-assets-why"),
    poster: whyHydrillaVideoPoster("3d-assets-why"),
  },
  blender: {
    video: whyHydrillaVideo("blender-why"),
    poster: whyHydrillaVideoPoster("blender-why"),
  },
  disc: {
    video: whyHydrillaVideo("disc-why"),
    poster: whyHydrillaVideoPoster("disc-why"),
  },
  mesh: {
    video: whyHydrillaVideo("mesh-why"),
    poster: whyHydrillaVideoPoster("mesh-why"),
  },
  model: {
    video: whyHydrillaVideo("model-why"),
    poster: whyHydrillaVideoPoster("model-why"),
  },
  texture: {
    video: whyHydrillaVideo("texture-why-model"),
    poster: whyHydrillaVideoPoster("texture-why-model"),
  },
  bike: whyHydrillaImage("bike-why", "f_webp,q_auto,c_fill,w_1000"),
  fish: whyHydrillaImage("fish-why", "f_webp,q_auto,c_fill,w_1000"),
  cta: whyHydrillaImage("cta-photo", "f_webp,q_auto,c_fill,w_1000"),
} as const;

/**
 * BlueFox showcase reel. One 720px MP4 plays at a time.
 * Posters are a single WebP frame so the card paints before any video bytes.
 */
const SHOWCASE_FOLDER = "hydrilla-landing/showcase";

export function showcaseClip(id: string): string {
  return cloudinaryVideo(
    `${SHOWCASE_FOLDER}/${id}`,
    "c_limit,w_720,q_auto,vc_auto,f_mp4"
  );
}

export function showcasePoster(id: string): string {
  return `${CLOUDINARY_VIDEO_BASE}/so_0,f_webp,q_auto,c_fill,w_760,h_1014/${VERSION}/${SHOWCASE_FOLDER}/${id}`;
}

const BLUEFOX_CLIPS = ["bluefox-sw", "bluefox-warmachine", "bluefox-spidy", "bluefox-arrow"] as const;

export const BLUEFOX_SHOWCASE = {
  poster: showcasePoster(BLUEFOX_CLIPS[0]),
  clips: BLUEFOX_CLIPS.map((id) => showcaseClip(id)),
} as const;

/**
 * Feature row art. Width stays at the source size (about 1600px) so the
 * picture is not scaled down. Format and quality are chosen per browser.
 */
export function featureImage(id: string): string {
  return cloudinaryImage(
    `hydrilla-landing/features/${id}`,
    "c_limit,w_1600,f_auto,q_auto:best"
  );
}

/** Pricing plan card images (WebP). */
export function pricingPlanImage(
  id: "pricing-1" | "pricing-2" | "pricing-3",
  transform = "f_webp,q_auto,c_fill,w_960"
): string {
  return cloudinaryImage(`hydrilla-landing/pricing/${id}`, transform);
}

export const PRICING_IMAGES = {
  free: pricingPlanImage("pricing-3"),
  starter: pricingPlanImage("pricing-1"),
  pro: pricingPlanImage("pricing-2"),
} as const;

/**
 * Workflow demo video and WebP poster.
 * Pre-transcoded with Cloudinary eager transformations (WebM VP9 + MP4 H.264, WebP poster).
 * Uses c_limit,w_1280,q_auto,vc_auto to conserve bandwidth on Cloudinary free tier.
 */
const WORKFLOW_FOLDER = "hydrilla-landing/workflow";

export const WORKFLOW_DEMO = {
  webm: `${CLOUDINARY_VIDEO_BASE}/c_limit,q_auto,vc_auto,w_1280/${VERSION}/${WORKFLOW_FOLDER}/hydrilla-demo.webm`,
  mp4: `${CLOUDINARY_VIDEO_BASE}/c_limit,q_auto,vc_auto,w_1280/${VERSION}/${WORKFLOW_FOLDER}/hydrilla-demo.mp4`,
  poster: `${CLOUDINARY_VIDEO_BASE}/c_limit,q_auto,so_0,w_1280/${VERSION}/${WORKFLOW_FOLDER}/hydrilla-demo.webp`,
} as const;

