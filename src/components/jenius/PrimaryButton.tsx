import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PrimaryButton — the main call-to-action across Jenius. Gradient fill,
 * glow, 44px+ tap target. Wraps the base Button with sensible defaults.
 */
export type PrimaryButtonProps = Omit<ButtonProps, "variant">;

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ size = "lg", className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="primary"
      size={size}
      className={cn("w-full", className)}
      {...props}
    />
  ),
);
PrimaryButton.displayName = "PrimaryButton";
