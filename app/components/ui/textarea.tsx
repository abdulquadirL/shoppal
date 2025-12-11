import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-neutral-300 p-3 text-sm focus-visible:ring-2 focus-visible:ring-black outline-none",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
