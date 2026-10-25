"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButtonWithHelp } from "@/components/support/UserButtonWithHelp";
import { useAppLayout } from "../../context/AppLayoutContext";
import { requestNotificationPermission } from "@/lib/browserNotifications";
import { ProductSwitch } from "./ProductSwitch";

const SECTION_LABELS: Record<string, string> = {
  studio: "Studio",
  assets: "Assets",
  image: "Assets",
  usage: "Usage",
  "api-keys": "API Keys",
  settings: "Settings",
  pricing: "Pricing",
  profile: "Profile",
};

export function AppNavbar() {
  const { openMobileSidebar } = useAppLayout();
  const section = SECTION_LABELS[usePathname()?.split("/")[2] ?? ""];

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-3 sm:px-4 md:px-5 pt-[env(safe-area-inset-top)] box-content bg-[var(--app-canvas)] border-b border-neutral-200/60">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={openMobileSidebar}
          className="md:hidden flex items-center justify-center rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-[var(--hyd-50)] transition-colors h-10 w-10 -ml-1 shrink-0"
          aria-label="Open menu"
          title="Menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        {section && (
          <span className="community-display truncate text-[16px] text-neutral-900">
            {section}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <ModeToggle className="h-10 w-10 sm:h-9 sm:w-9 rounded-full border-transparent bg-transparent shadow-none text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" />
        <button
          type="button"
          onClick={() => {
            void requestNotificationPermission();
          }}
          className="flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors h-10 w-10 sm:h-9 sm:w-9 shrink-0"
          aria-label="Notifications"
          title="Enable completion notifications"
        >
          <Bell className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
        </button>
        {/* Same slot as in the community header: directly left of the avatar, so it never moves. */}
        <ProductSwitch active="studio" className="mx-1.5 sm:mx-2" />
        <div className="flex items-center justify-center h-9 w-9 shrink-0">
          <UserButtonWithHelp
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 ring-0",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
