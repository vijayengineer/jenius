import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Jenius Sheet — mobile bottom sheet built on Radix Dialog. Handles the
 * common pattern for lesson details, misconception explainers, and
 * settings. Distinct wrapper from the shadcn `sheet` primitive so we can
 * tune motion, radii, and safe-area padding to the Jenius design system.
 */

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-md",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

export interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  title: string;
  description?: string;
  hideHeader?: boolean;
  showClose?: boolean;
  closeLabel?: string;
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      className,
      title,
      description,
      hideHeader,
      showClose = true,
      closeLabel = "Close",
      children,
      ...props
    },
    ref,
  ) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "jenius-sheet-surface fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[460px] flex-col",
          "glass-strong overflow-hidden rounded-t-3xl border-t border-white/10",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          "duration-300",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="mx-auto mb-2 mt-3 h-1.5 w-10 shrink-0 rounded-full bg-white/25"
        />

        <div className="flex shrink-0 items-start justify-between gap-4 px-4 pb-2">
          <div className={cn("min-w-0 pl-2 pt-1", hideHeader && "sr-only")}>
            <DialogPrimitive.Title className="font-display text-xl font-semibold tracking-tight">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          {showClose ? (
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="ml-auto grid size-11 shrink-0 place-items-center rounded-full bg-white/8 text-foreground transition-swift hover:bg-white/12"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          ) : null}
        </div>

        <div
          className={cn(
            "no-scrollbar min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain px-6",
            "pb-[max(env(safe-area-inset-bottom),1.5rem)]",
            hideHeader ? "pt-1" : "pt-3",
          )}
        >
          {children}
        </div>
      </DialogPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = "SheetContent";
