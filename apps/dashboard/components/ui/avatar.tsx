"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

/**
 * Pawkit Avatar (shadcn-style, Radix UI under the hood).
 *
 * Three pieces:
 *   - `<Avatar>`         the round container (sized via className)
 *   - `<AvatarImage>`    the photo; Radix handles the load failure +
 *                        swap to the fallback automatically
 *   - `<AvatarFallback>` initials / icon shown while image loads or if
 *                        it errors
 *
 * Used for:
 *   - Clinic mark in the top bar
 *   - Vet avatar in the top bar
 *   - Vet avatar in settings (with upload-on-click via a wrapping `<Button>`)
 *   - Clinic logo slot in settings (square via `rounded-md` override)
 *
 * NOT used for pets — pets have a richer fur-tone-ring treatment that lives
 * in `components/ui/pet-avatar.tsx`. Keep the two separate.
 */

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center font-semibold",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
