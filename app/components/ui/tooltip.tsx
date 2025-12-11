"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>;
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>;
}

export function TooltipContent({ content }: { content: string }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side="top"
        className="rounded-md bg-black px-2 py-1 text-xs text-white"
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
