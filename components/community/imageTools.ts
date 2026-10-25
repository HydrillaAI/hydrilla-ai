/**
 * Client-side image prep for community uploads: cover-crop to an aspect ratio, cap the size,
 * and encode as WebP so uploads stay well under the backend's 2 MB limit.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image"));
    img.src = src;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Crops the centre of `source` to width/height's aspect and scales it down to fit.
 * With `fit: "contain"` it keeps the original aspect and only scales down to fit the box.
 */
export async function prepareImage(
  source: File | string,
  width: number,
  height: number,
  { quality = 0.86, fit = "cover" }: { quality?: number; fit?: "cover" | "contain" } = {}
): Promise<string> {
  if (source instanceof File && !/^image\/(png|jpe?g|webp)$/.test(source.type)) {
    throw new Error("Use a PNG, JPEG or WebP image");
  }
  if (source instanceof File && source.size > 20 * 1024 * 1024) {
    throw new Error("Images must be under 20 MB");
  }
  const img = await loadImage(source instanceof File ? await readFile(source) : source);
  const target = width / height;
  const srcRatio = img.naturalWidth / img.naturalHeight;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (fit === "cover") {
    if (srcRatio > target) sw = sh * target;
    else sh = sw / target;
  }
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  const scale = Math.min(1, width / sw, height / sh);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing isn't available in this browser");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", quality);
}
