#!/usr/bin/env node

import { v2 as cloudinary } from "cloudinary";
import { readFileSync } from "node:fs";

function loadLocalEnv() {
  const text = readFileSync(".env.local", "utf8");
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const env = loadLocalEnv();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const assets = [
  ["public/workflow/image.png", "hydrilla-landing/workflow/workspace"],
  ["public/workflow/worflow-image-mobile.png", "hydrilla-landing/workflow/workflow-mobile"],
  ["public/herohydrillasrc.jpg", "hydrilla-landing/hero/poster"],
  ["public/usecase/games.jpg", "hydrilla-landing/usecase/games"],
  ["public/usecase/archi.jpg", "hydrilla-landing/usecase/archi"],
  ["public/usecase/prod.jpg", "hydrilla-landing/usecase/prod"],
  ["public/usecase/arvr3.jpg", "hydrilla-landing/usecase/arvr3"],
];

const videoAssets = [
  ["public/herohydrilla.mp4", "hydrilla-landing/hero/backdrop"],
  ["public/demo/Hydrilla-Demo.mp4", "hydrilla-landing/workflow/hydrilla-demo"],
];

const optimizedUrl = (publicId) =>
  cloudinary.url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
  });

const results = [];

for (const [file, publicId] of assets) {
  const result = await cloudinary.uploader.upload(file, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });

  results.push({
    file,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    optimizedUrl: optimizedUrl(result.public_id),
  });
}

for (const [file, publicId] of videoAssets) {
  const result = await cloudinary.uploader.upload(file, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: "video",
  });

  results.push({
    file,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    optimizedUrl: cloudinary.url(result.public_id, {
      secure: true,
      resource_type: "video",
      quality: "auto",
    }),
  });
}

console.log(JSON.stringify(results, null, 2));
