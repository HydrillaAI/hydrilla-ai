import { z } from "zod";

// Strip control characters (keep \n and \t) so titles/bios can't smuggle terminal
// escapes or zero-width tricks; React escapes HTML on render.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/g;

function cleanText(max: number) {
  return z
    .string()
    .transform((v) => v.replace(CONTROL_CHARS, "").trim())
    .pipe(z.string().max(max));
}

/** Same rules as the users_username_format CHECK in sql/027. */
export const USERNAME_PATTERN = /^[a-z0-9]([a-z0-9._]*[a-z0-9])?$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(30, "Use at most 30 characters")
  .regex(USERNAME_PATTERN, "Use letters, numbers, dots and underscores; start and end with a letter or number")
  .refine((v) => !/[._]{2}/.test(v), "Dots and underscores can't be next to each other");

export const POST_LICENSES = ["cc0", "cc-by-4.0", "cc-by-nc-4.0", "all-rights-reserved"] as const;
export const REPORT_REASONS = ["spam", "nsfw", "violence", "harassment", "copyright", "other"] as const;

const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{0,23}$/, "Tags use letters, numbers and hyphens");

const nullableUrl = z
  .string()
  .trim()
  .url()
  .max(2048)
  .nullable()
  .optional();

const postItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("model"), jobId: z.string().trim().min(1).max(64) }),
  z.object({ kind: z.literal("image"), imageUrl: z.string().trim().url().max(2048) }),
]);

export const createPostSchema = z.object({
  title: cleanText(70).pipe(z.string().min(1, "Title is required")),
  description: cleanText(2000).default(""),
  tags: z.array(tagSchema).max(5).default([]),
  license: z.enum(POST_LICENSES).default("cc-by-nc-4.0"),
  allowDownload: z.boolean().default(true),
  showPrompt: z.boolean().default(false),
  coverImageUrl: nullableUrl,
  items: z.array(postItemSchema).min(1, "Add at least one model or image").max(10),
});
export type CreatePostBody = z.infer<typeof createPostSchema>;

export const updatePostSchema = z
  .object({
    title: cleanText(70).pipe(z.string().min(1, "Title is required")),
    description: cleanText(2000),
    tags: z.array(tagSchema).max(5),
    license: z.enum(POST_LICENSES),
    allowDownload: z.boolean(),
    showPrompt: z.boolean(),
    coverImageUrl: nullableUrl,
  })
  .partial();
export type UpdatePostBody = z.infer<typeof updatePostSchema>;

export const updateProfileSchema = z
  .object({
    username: usernameSchema,
    displayName: cleanText(50).nullable(),
    bio: cleanText(280).nullable(),
    website: z
      .string()
      .trim()
      .max(200)
      .nullable()
      .transform((v) => {
        if (!v) return null;
        return /^https?:\/\//i.test(v) ? v : `https://${v}`;
      })
      .pipe(z.string().url("Enter a valid website").nullable()),
    avatarUrl: nullableUrl,
    bannerUrl: nullableUrl,
  })
  .partial();
export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

export const commentSchema = z.object({
  body: cleanText(1000).pipe(z.string().min(1, "Comment can't be empty")),
  parentCommentId: z.string().uuid().nullable().optional(),
});

export const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "user"]),
  targetId: z.string().trim().min(1).max(64),
  reason: z.enum(REPORT_REASONS),
  details: cleanText(1000).nullable().optional(),
});

export const uploadSchema = z.object({
  kind: z.enum(["avatar", "banner", "cover", "image"]),
  dataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Upload a PNG, JPEG or WebP image")
    .max(3_000_000, "Image is too large"),
});

export const backfillCoverSchema = z.object({
  jobId: z.string().trim().min(1).max(64),
  dataUrl: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Upload a PNG, JPEG or WebP image")
    .max(3_000_000, "Image is too large"),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message || "Invalid request";
}
