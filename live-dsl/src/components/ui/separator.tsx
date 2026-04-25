import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        // horizontal defaults
        "data-horizontal:h-px data-horizontal:w-full",
        // vertical defaults (stretch)
        "data-vertical:w-px data-vertical:self-stretch",
        // override stretch if a height is applied
        "[&:where([class*=h-])]:self-center",
        className
      )}
      {...props}
    />
  )
}

export { Separator }