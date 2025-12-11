"use client";

import { cn } from "@/lib/cn";
import * as TabsPrimitive from "@radix-ui/react-tabs";


export function Tabs({ children, defaultValue }: any) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} className="w-full">
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children }: any) {
  return (
    <TabsPrimitive.List className="flex border-b border-neutral-200">
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ children, value }: any) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "px-4 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-black"
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ children, value }: any) {
  return (
    <TabsPrimitive.Content value={value} className="py-4">
      {children}
    </TabsPrimitive.Content>
  );
}
