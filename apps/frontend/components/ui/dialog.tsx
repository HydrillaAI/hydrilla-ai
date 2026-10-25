"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

/**
 * Frosted overlay + floating card, matching NewWorkspaceDialog. Renders inside `.app-themed`
 * so neutral-* utilities follow light/dark.
 */
const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean;
    overlayClassName?: string;
  }
>(({ className, children, hideClose, overlayClassName, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        "app-themed fixed inset-0 z-[80] bg-black/40 backdrop-blur-md community-overlay-in",
        overlayClassName
      )}
    />
    <div className="app-themed community-root fixed inset-0 z-[81] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "studio-float community-pop-in pointer-events-auto relative w-full max-w-lg max-h-[calc(100dvh-24px)] overflow-hidden rounded-[24px] border border-neutral-200/70 bg-white text-neutral-900 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.32)] outline-none",
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </div>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription };
