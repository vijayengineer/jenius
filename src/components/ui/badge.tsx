import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-swift [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "gradient-brand text-primary-foreground shadow-sm",
        soft: "bg-white/8 text-foreground border border-white/10",
        outline: "border border-border-strong text-foreground",
        success: "bg-success/15 text-success border border-success/30",
        destructive: "bg-destructive/15 text-destructive border border-destructive/30",
        muted: "bg-muted text-muted-foreground",
        new: "bg-brand-blue/20 text-brand-blue border border-brand-blue/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
