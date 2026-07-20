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
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, title, description, hideHeader, showClose = true, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[460px]",
        "glass-strong rounded-t-3xl border-t border-white/10 p-6 pt-4",
        "pb-[max(env(safe-area-inset-bottom),1.5rem)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        "duration-300",
        className,
      )}
      {...props}
    >
      <div aria-hidden className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/25" />

      <div className={cn("flex items-start justify-between gap-4", hideHeader && "sr-only")}>
        <div>
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
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full bg-white/8 text-foreground transition-swift hover:bg-white/12"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </div>

      <div className={cn(hideHeader ? "" : "mt-5")}>{children}</div>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";
