"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkUsername,
  CommunityApiError,
  profileGradient,
  updateOwnProfile,
  uploadCommunityImage,
  type OwnProfile,
  type ProfilePatch,
} from "@/lib/community";
import { track } from "@/lib/analytics";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCommunity } from "./CommunityProvider";
import { UserAvatar } from "./UserAvatar";
import { prepareImage } from "./imageTools";

type Availability = { state: "idle" | "checking" | "ok" | "taken"; reason?: string | null };

const fieldClass =
  "w-full rounded-2xl border border-neutral-200 bg-white px-4 text-[14px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400";

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={cn("text-[11px] tabular-nums", value.length > max ? "text-red-600" : "text-neutral-400")}>
      {value.length}/{max}
    </span>
  );
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: OwnProfile;
  onSaved: (profile: OwnProfile) => void;
}) {
  const { getToken, setMe } = useCommunity();
  const [displayName, setDisplayName] = useState(profile.displayName === profile.username ? "" : profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.websiteUrl ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [availability, setAvailability] = useState<Availability>({ state: "idle" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  const handle = username.trim().toLowerCase();
  const handleChanged = handle !== profile.username;
  const lockedUntil = profile.usernameChangeAvailableAt ? new Date(profile.usernameChangeAvailableAt) : null;

  useEffect(() => {
    if (!handleChanged) {
      setAvailability({ state: "idle" });
      return;
    }
    setAvailability({ state: "checking" });
    const controller = new AbortController();
    const t = setTimeout(() => {
      checkUsername(getToken, handle, controller.signal)
        .then((r) => setAvailability(r.available ? { state: "ok" } : { state: "taken", reason: r.reason }))
        .catch((err) => {
          if ((err as Error)?.name !== "AbortError") setAvailability({ state: "idle" });
        });
    }, 350);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [handle, handleChanged, getToken]);

  const pickImage = async (kind: "avatar" | "banner", file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(kind);
    try {
      const dataUrl = kind === "avatar" ? await prepareImage(file, 512, 512) : await prepareImage(file, 1500, 500);
      const url = await uploadCommunityImage(getToken, kind, dataUrl);
      if (kind === "avatar") setAvatarUrl(url);
      else setBannerUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const invalid =
    displayName.length > 50 ||
    bio.length > 280 ||
    (handleChanged && availability.state !== "ok") ||
    uploading !== null;

  const save = async () => {
    if (invalid || saving) return;
    const patch: ProfilePatch = {};
    if (handleChanged) patch.username = handle;
    if (displayName.trim() !== (profile.displayName === profile.username ? "" : profile.displayName)) {
      patch.displayName = displayName.trim() || null;
    }
    if (bio.trim() !== (profile.bio ?? "")) patch.bio = bio.trim() || null;
    if (website.trim() !== (profile.websiteUrl ?? "")) patch.website = website.trim() || null;
    if (avatarUrl !== profile.avatarUrl) patch.avatarUrl = avatarUrl;
    if (bannerUrl !== profile.bannerUrl) patch.bannerUrl = bannerUrl;
    if (Object.keys(patch).length === 0) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const next = await updateOwnProfile(getToken, patch);
      setMe(next);
      track("profile_updated", { username_changed: Boolean(patch.username) });
      onSaved(next);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof CommunityApiError ? err.message : "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  };

  const preview = { displayName: displayName || profile.username, username: handle, avatarUrl };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-xl flex-col" hideClose>
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <DialogTitle className="community-display text-[20px]">Edit profile</DialogTitle>
          <DialogDescription className="sr-only">Update how you appear in the Hydrilla community.</DialogDescription>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 scrollbar-minimal">
          <div className="relative">
            <button
              type="button"
              onClick={() => bannerInput.current?.click()}
              className="group relative block h-32 w-full overflow-hidden rounded-[18px]"
              style={bannerUrl ? undefined : { background: profileGradient(handle || profile.username) }}
              aria-label="Change banner"
            >
              {bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 text-[13px] font-medium text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                {uploading === "banner" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Change banner
              </span>
            </button>
            {bannerUrl && (
              <button
                type="button"
                onClick={() => setBannerUrl(null)}
                className="absolute right-2 top-2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/60"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              className="group absolute -bottom-9 left-4 rounded-full ring-4 ring-white"
              aria-label="Change avatar"
            >
              <UserAvatar user={preview} size={80} />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                {uploading === "avatar" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </span>
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                void pickImage("avatar", e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={bannerInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                void pickImage("banner", e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-12 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-[13px] font-medium text-neutral-700">
                Display name
                <Counter value={displayName} max={50} />
              </span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profile.username}
                className={cn(fieldClass, "h-11")}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-neutral-700">Username</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-neutral-400">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "").toLowerCase())}
                  disabled={Boolean(lockedUntil)}
                  maxLength={30}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={cn(fieldClass, "h-11 pl-8 pr-10 disabled:opacity-60")}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {availability.state === "checking" && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                  {availability.state === "ok" && <Check className="h-4 w-4 text-emerald-500" />}
                  {availability.state === "taken" && <X className="h-4 w-4 text-red-500" />}
                </span>
              </div>
              <span
                className={cn(
                  "text-[12px]",
                  availability.state === "taken" ? "text-red-600" : "text-neutral-500"
                )}
              >
                {lockedUntil
                  ? `You can change your username again on ${lockedUntil.toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`
                  : availability.state === "taken"
                    ? availability.reason
                    : `hydrilla.ai/@${handle || "username"} · You can change it once every 30 days.`}
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-[13px] font-medium text-neutral-700">
                Bio
                <Counter value={bio} max={280} />
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="What do you make?"
                className={cn(fieldClass, "resize-none py-3")}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-neutral-700">Website</span>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="yourportfolio.com"
                inputMode="url"
                maxLength={200}
                className={cn(fieldClass, "h-11")}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-neutral-200/70 px-6 py-4">
          {error ? <p className="min-w-0 flex-1 text-[13px] text-red-600">{error}</p> : <span className="flex-1" />}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-full px-4 text-[14px] font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={invalid || saving}
            onClick={() => void save()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[14px] font-semibold text-white hover:bg-neutral-700 disabled:opacity-40"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
