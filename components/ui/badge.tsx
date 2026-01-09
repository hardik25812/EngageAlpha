import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent/10 text-accent",
        secondary:
          "border-transparent bg-background-card text-foreground-muted",
        destructive:
          "border-transparent bg-red-600/10 text-red-500",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-600/10 text-emerald-500",
        warning: "border-transparent bg-amber-600/10 text-amber-500",
        revive: "border-transparent bg-revive/10 text-revive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
