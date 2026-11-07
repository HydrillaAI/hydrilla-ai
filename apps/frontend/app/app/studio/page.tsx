"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  fetchWorkspaces,
  createWorkspaceApi,
  deleteWorkspaceApi,
  updateWorkspaceNameApi,
  type Workspace,
} from "../../../lib/api";
import { setCurrentWorkspaceId } from "../../../lib/utils";
import {
  bootstrapHeroWorkspace,
  peekPendingHeroPrompt,
} from "../../../lib/pendingHeroPrompt";
import { track, trackWorkspaceEntry } from "../../../lib/analytics";
import { MessageSquare, FolderOpen, Plus, Search, RotateCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WorkspaceFolderCard } from "@/components/app/WorkspaceFolderCard";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function StudioPage() {
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const SHOW_QUICK_START_CHAT = false;
  const userName = user?.firstName || user?.fullName || user?.username || "";
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameSaving, setRenameSaving] = useState(false);
  const renameLock = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(searchQuery);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteConfirmWorkspace, setDeleteConfirmWorkspace] = useState<Workspace | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  /** True while applying a landing-page hero prompt (create workspace → open it). */
  const [heroBootstrapping, setHeroBootstrapping] = useState(false);
  const heroBootstrapStarted = useRef(false);

  // Before paint: if hero prompt is pending, skip the studio list loader entirely.
  useLayoutEffect(() => {
    if (!peekPendingHeroPrompt()) return;
    setHeroBootstrapping(true);
    setLoading(false);
  }, []);

  // Hero → login → studio: create named workspace, then open it with prompt prefilled.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!peekPendingHeroPrompt()) return;
    if (heroBootstrapStarted.current) return;
    heroBootstrapStarted.current = true;

    let cancelled = false;
    setHeroBootstrapping(true);
    setLoading(false);
    setActionError(null);

    // Warm the Clerk token while we kick off create (avoids a serial wait).
    const tokenReady = getToken();

    void (async () => {
      try {
        await tokenReady;
        const result = await bootstrapHeroWorkspace(async (name) => {
          const tokenGetter = async () => (await getToken()) ?? "";
          return createWorkspaceApi(name, tokenGetter);
        });
        if (cancelled) return;
        if (!result) {
          setHeroBootstrapping(false);
          return;
        }
        setCurrentWorkspaceId(result.workspaceId);
        trackWorkspaceEntry(userId ?? null, result.workspaceId);
        router.replace(`/workspace/${result.workspaceId}`);
      } catch (err: unknown) {
        console.error("Failed to bootstrap hero workspace:", err);
        if (!cancelled) {
          setActionError(
            err instanceof Error
              ? err.message
              : "Could not create workspace. Check that the backend is running."
          );
          setHeroBootstrapping(false);
          heroBootstrapStarted.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, router]);

  const loadWorkspaces = async () => {
    if (!isSignedIn) return;
    // Hero flow owns workspace creation — don't also create a Demo Workspace.
    if (peekPendingHeroPrompt() || heroBootstrapping) return;
    setLoading(true);
    setActionError(null);
    try {
      const tokenGetter = async () => await getToken();
      const ws = await fetchWorkspaces(tokenGetter);
      setWorkspaces(ws);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Could not load workspaces."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (peekPendingHeroPrompt() || heroBootstrapping) return;
    void loadWorkspaces();
  }, [isLoaded, isSignedIn, heroBootstrapping]);

  const handleCreateWorkspace = async () => {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    setActionError(null);
    try {
      const tokenGetter = async () => await getToken();
      const ws = await createWorkspaceApi(name, tokenGetter);
      track("workspace_created", { source: "studio" });
      trackWorkspaceEntry(userId ?? null, ws.id);
      setShowNewModal(false);
      setNewName("");
      setCurrentWorkspaceId(ws.id);
      router.push(`/workspace/${ws.id}`);
    } catch (err: unknown) {
      console.error("Failed to create workspace:", err);
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not create workspace. Check that the backend is running."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    track("workspace_opened", { source: "studio" });
    trackWorkspaceEntry(userId ?? null, workspaceId);
    setCurrentWorkspaceId(workspaceId);
    router.push(`/workspace/${workspaceId}`);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    setDeleteConfirmWorkspace(null);
    setDeletingId(workspaceId);
    try {
      const tokenGetter = async () => await getToken();
      await deleteWorkspaceApi(workspaceId, tokenGetter);
      track("workspace_deleted", { source: "studio" });
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
    } catch (err: unknown) {
      console.error("Failed to delete workspace:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateWorkspace = async (ws: Workspace) => {
    setDuplicatingId(ws.id);
    try {
      const tokenGetter = async () => await getToken();
      const newWs = await createWorkspaceApi(`${ws.name} (Copy)`, tokenGetter);
      setWorkspaces((prev) => [newWs, ...prev]);
    } catch (err: unknown) {
      console.error("Failed to duplicate workspace:", err);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleStartRename = (ws: Workspace) => {
    setRenamingId(ws.id);
  };

  const handleSaveRename = async (name: string) => {
    const next = name.trim();
    if (!renamingId || !next || renameLock.current) return;
    renameLock.current = true;
    setRenameSaving(true);
    try {
      const tokenGetter = async () => await getToken();
      await updateWorkspaceNameApi(renamingId, next, tokenGetter);
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === renamingId ? { ...w, name: next, updatedAt: new Date().toISOString() } : w,
        ),
      );
      setRenamingId(null);
    } catch (err: unknown) {
      console.error("Failed to rename workspace:", err);
    } finally {
      renameLock.current = false;
      setRenameSaving(false);
    }
  };

  useEffect(() => {
    if (!showNewModal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !creating) setShowNewModal(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showNewModal, creating]);

  // "/" jumps to search, like every other console.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const el = event.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close the delete dialog with Escape.
  useEffect(() => {
    if (!deleteConfirmWorkspace) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletingId) setDeleteConfirmWorkspace(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteConfirmWorkspace, deletingId]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return workspaces
      .filter((ws) => !q || ws.name.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [workspaces, deferredQuery]);

  // Hero handoff: minimal transition — don't paint the studio list while we create + open.
  if (heroBootstrapping) {
    return (
      <div className="app-content-page font-dm-sans flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[color:var(--hyd-100)] border-t-neutral-900 rounded-full animate-spin" />
        <p className="text-sm text-neutral-500">Opening your workspace…</p>
        {actionError && (
          <div className="mt-2 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {actionError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-content-page font-dm-sans bg-[var(--app-canvas)]">
      <section className="flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-neutral-900 tracking-[-0.03em] leading-[1.1] truncate">
              Workspaces
            </h1>
            <p className="mt-2 text-sm text-neutral-500 max-w-md truncate">
              {getGreeting()}
              {userName ? `, ${userName}` : ""}
              {!loading && workspaces.length > 0 && (
                <>
                  <span aria-hidden className="mx-2 text-[color:var(--hyd-200)]">/</span>
                  <span className="tabular-nums">
                    {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full lg:w-auto lg:shrink-0">
            <div className="relative min-w-0 flex-1 lg:flex-none lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" strokeWidth={1.75} />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search workspaces"
                aria-label="Search workspaces"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                    e.currentTarget.blur();
                  }
                }}
                className="peer w-full h-10 pl-9 pr-9 text-sm bg-[var(--hyd-50)] border border-transparent rounded-[10px] text-neutral-900 placeholder:text-neutral-400 hover:bg-[var(--hyd-100)]/50 focus:bg-white focus:border-[color:var(--hyd-400)] focus:ring-4 focus:ring-[color:var(--hyd-100)] outline-none transition-[background-color,border-color,box-shadow] [&::-webkit-search-cancel-button]:hidden"
              />
              <kbd
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 min-w-5 items-center justify-center rounded border border-[color:var(--hyd-100)] bg-white/60 px-1 text-[11px] font-medium text-neutral-500 sm:inline-flex peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden"
              >
                /
              </kbd>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewName("");
                setActionError(null);
                setShowNewModal(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 h-10 px-3.5 sm:px-4 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-[10px] transition-[background-color,transform] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--hyd-400)]"
              aria-haspopup="dialog"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New workspace</span>
            </button>
          </div>
        </div>

        {actionError && !showNewModal && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200/80 bg-red-50/70 px-4 py-3 text-sm text-red-800"
          >
            <span className="min-w-0">{actionError}</span>
            <button
              type="button"
              onClick={() => void loadWorkspaces()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-red-800 hover:bg-red-100/70 transition-colors"
            >
              <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div aria-busy="true" aria-label="Loading workspaces" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="studio-skeleton w-full rounded-[24px]" style={{ aspectRatio: "340 / 326" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--hyd-200)] bg-[var(--hyd-50)] px-6 py-16 sm:py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-white border border-[color:var(--hyd-100)] flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 text-[color:var(--hyd-400)]" strokeWidth={1.5} />
            </div>
            <p className="text-[16px] font-semibold text-neutral-900 tracking-tight mb-1">
              {searchQuery ? "No matches" : "No workspaces yet"}
            </p>
            <p className="text-sm text-neutral-500 mb-5">
              {searchQuery
                ? `Nothing matches "${searchQuery}".`
                : "Create a workspace to start generating."}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center h-9 px-4 text-sm font-medium text-neutral-900 bg-white border border-[color:var(--hyd-100)] hover:border-[color:var(--hyd-200)] rounded-lg transition-colors"
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setNewName(""); setActionError(null); setShowNewModal(true); }}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New workspace
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8 sm:gap-x-6 sm:gap-y-10 items-start pt-3">
            {filtered.map((ws, index) => (
              <WorkspaceFolderCard
                key={ws.id}
                workspace={ws}
                index={index}
                duplicating={duplicatingId === ws.id}
                editing={renamingId === ws.id}
                onOpen={handleOpenWorkspace}
                onRename={handleStartRename}
                onRenameSave={(name) => {
                  if (!renameSaving) void handleSaveRename(name);
                }}
                onRenameCancel={() => {
                  if (!renameSaving) setRenamingId(null);
                }}
                onDuplicate={handleDuplicateWorkspace}
                onDelete={setDeleteConfirmWorkspace}
                getToken={getToken}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick start – bottom, clearly separated */}
      {SHOW_QUICK_START_CHAT && (
        <section className="mt-auto pt-6 sm:pt-8 border-t border-neutral-200">
          <h2 className="text-xs sm:text-sm font-medium text-neutral-700 uppercase tracking-wider mb-3 sm:mb-4">
            Quick start
          </h2>
          <Link
            href="/generate"
            className="group inline-flex items-center gap-3 sm:gap-4 w-full max-w-[280px] p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-neutral-900 text-sm sm:text-base">Chat</p>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">Generate in a conversation</p>
            </div>
          </Link>
        </section>
      )}

      {/* Create workspace */}
      <Dialog open={showNewModal} onOpenChange={(open) => !creating && setShowNewModal(open)}>
        <DialogContent className="max-w-[440px] p-7 sm:p-8" hideClose>
          <DialogTitle className="community-display text-[26px] leading-tight text-neutral-900">New workspace</DialogTitle>
          <DialogDescription className="sr-only">Name your new workspace.</DialogDescription>
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateWorkspace();
            }}
          >
            <label htmlFor="new-workspace-name" className="sr-only">
              Workspace name
            </label>
            <input
              id="new-workspace-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workspace name"
              maxLength={60}
              autoFocus
              autoComplete="off"
              disabled={creating}
              className="h-12 w-full rounded-full border border-neutral-200 bg-neutral-50 px-5 text-[16px] text-neutral-900 outline-none transition-[border-color,background-color,box-shadow] placeholder:text-neutral-400 focus:border-[var(--hyd-400)] focus:bg-white focus:shadow-[0_0_0_4px_var(--hyd-100)] disabled:opacity-60 sm:text-[15px]"
            />

            {actionError && (
              <p role="alert" className="mt-3 rounded-2xl bg-red-500/10 px-4 py-2.5 text-[13px] text-red-700 dark:text-red-400">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                disabled={creating}
                className="h-11 flex-1 rounded-full text-[14px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 sm:flex-none sm:px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim() || creating}
                className="h-11 flex-1 rounded-full bg-neutral-900 px-6 text-[14px] font-semibold text-white transition-[background-color,opacity] hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30 sm:ml-auto sm:flex-none"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete workspace confirmation */}
      <Dialog
        open={Boolean(deleteConfirmWorkspace)}
        onOpenChange={(open) => !open && !deletingId && setDeleteConfirmWorkspace(null)}
      >
        <DialogContent className="max-w-[420px] p-7 sm:p-8" hideClose role="alertdialog">
          <DialogTitle className="community-display text-[24px] leading-tight text-neutral-900">Delete workspace?</DialogTitle>
          <DialogDescription className="mt-2 text-[14px] leading-relaxed text-neutral-500">
            &ldquo;{deleteConfirmWorkspace?.name}&rdquo; will be removed. The models and images inside it stay in your assets.
          </DialogDescription>
          <div className="mt-7 flex gap-2">
            <button
              type="button"
              onClick={() => !deletingId && setDeleteConfirmWorkspace(null)}
              disabled={!!deletingId}
              autoFocus
              className="h-11 flex-1 rounded-full text-[14px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:flex-none sm:px-5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => deleteConfirmWorkspace && handleDeleteWorkspace(deleteConfirmWorkspace.id)}
              disabled={!!deletingId}
              className="h-11 flex-1 rounded-full bg-red-600 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:flex-none"
            >
              {deletingId && deletingId === deleteConfirmWorkspace?.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
