import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-black outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
