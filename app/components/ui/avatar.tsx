import Image from "next/image";
import { cn } from "@/lib/cn";

export function Avatar({
  src,
  alt,
  className,
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div className={cn("h-10 w-10 rounded-full bg-neutral-200 overflow-hidden", className)}>
      {src ? (
        <Image src={src} alt={alt ?? "avatar"} width={40} height={40} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
          ?
        </div>
      )}
    </div>
  );
}
