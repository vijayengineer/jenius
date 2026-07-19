import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer select-none transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "gradient-brand text-primary-foreground shadow-glow hover:shadow-glow-lg hover:brightness-110",
        secondary:
          "bg-surface-elevated text-foreground border border-border-strong hover:bg-accent",
        glass:
          "glass text-foreground hover:bg-white/10",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-white/5",
        ghost:
          "bg-transparent text-foreground hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-full [&_svg]:size-4",
        md: "h-12 px-6 text-[15px] rounded-full [&_svg]:size-[18px]",
        lg: "h-14 px-8 text-base rounded-full [&_svg]:size-5",
        xl: "h-16 px-10 text-lg rounded-full [&_svg]:size-6",
        icon: "h-12 w-12 rounded-full [&_svg]:size-5",
        "icon-sm": "h-10 w-10 rounded-full [&_svg]:size-4",
        "icon-lg": "h-14 w-14 rounded-full [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
