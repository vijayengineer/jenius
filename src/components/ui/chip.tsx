import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Chip — interactive selectable pill. Used for topics, filters, and
 * category selection in the Jenius feed. Distinct from Badge (status).
 */
const chipVariants = cva(
  "inline-flex items-center gap-2 rounded-full font-medium cursor-pointer select-none transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white/6 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20",
        active:
          "gradient-brand text-primary-foreground border border-white/15 shadow-glow",
        glass: "glass text-foreground hover:bg-white/10",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-white/5",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-5 text-[15px] [&_svg]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  active?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, size, active, type = "button", ...props }, ref) => {
    const resolvedVariant = active ? "active" : variant;
    return (
      <button
        ref={ref}
        type={type}
        data-state={active ? "active" : "inactive"}
        className={cn(chipVariants({ variant: resolvedVariant, size }), className)}
        {...props}
      />
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
