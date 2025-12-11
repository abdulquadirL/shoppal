"use client";

import { cn } from "@/lib/cn";
import * as SheetPrimitive from "@radix-ui/react-dialog";


export function Sheet({ children }: { children: React.ReactNode }) {
  return <SheetPrimitive.Root>{children}</SheetPrimitive.Root>;
}

export const SheetTrigger = SheetPrimitive.Trigger;

export function SheetContent({ children }: { children: React.ReactNode }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 bg-black/40" />

      <SheetPrimitive.Content
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-6"
        )}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
