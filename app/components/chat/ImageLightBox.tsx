"use client";

import { X } from "lucide-react";

type Props = {
  src: string;
  onClose: () => void;
};

export default function ImageLightbox({ src, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white"
        onClick={onClose}
      >
        <X size={28} />
      </button>

      <img
        src={src}
        alt="preview"
        className="max-h-[90vh] max-w-[90vw] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
