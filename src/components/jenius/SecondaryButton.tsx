import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SecondaryButton — supporting action. Glass surface, neutral border,
 * matches PrimaryButton in size for stacked layouts.
 */
export type SecondaryButtonProps = Omit<ButtonProps, "variant">;

export const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ size = "lg", className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="glass"
      size={size}
      className={cn("w-full", className)}
      {...props}
    />
  ),
);
SecondaryButton.displayName = "SecondaryButton";
