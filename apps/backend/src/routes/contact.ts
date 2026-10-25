import { Router, Request, Response } from "express";
import { supabase } from "../db.js";
import { logger } from "../logger.js";
import { onFormMessage } from "../services/notifications.js";

export const contactRouter = Router();

/**
 * POST /api/contact — contact and enterprise forms, stored in Supabase contact_messages.
 * The contact page sends no use_case and the enterprise page sends a free-text engine,
 * so use_case is optional free text (it used to be a fixed list, which rejected both forms).
 * The enterprise page is the one that sends studio_size.
 */
contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { full_name, work_email, company, use_case, studio_size, message } = req.body as Record<string, string>;

    if (!full_name?.trim() || !work_email?.trim() || !message?.trim()) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["full_name", "work_email", "message"],
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email.trim())) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const useCase = use_case?.trim().slice(0, 120) || "Other";
    const studioSize = studio_size?.trim() || null;

    const { error } = await supabase.from("contact_messages").insert({
      full_name: full_name.trim(),
      work_email: work_email.trim(),
      company: company?.trim() || null,
      use_case: useCase,
      studio_size: studioSize,
      message: message.trim(),
    });

    if (error) {
      logger.error({ err: error }, "Contact form insert failed");
      return res.status(500).json({ error: "Failed to save message" });
    }

    onFormMessage({
      kind: studioSize ? "enterprise" : "contact",
      name: full_name.trim(),
      email: work_email.trim(),
      company: company?.trim() || null,
      message: message.trim(),
      details: { "use case / engine": use_case?.trim(), "studio size": studioSize },
    });

    return res.status(201).json({ ok: true });
  } catch (err: unknown) {
    logger.error({ err }, "Contact form error");
    return res.status(500).json({ error: "Internal server error" });
  }
});
