"use client";

import { useMemo } from "react";
import { qrMatrix } from "@/lib/qr";

const QUIET_ZONE = 4;

// Always dark modules on white, in both themes, so phone cameras can read it.
export function QrPreview({ text, label }: { text: string; label: string }) {
  const { size, path } = useMemo(() => {
    const matrix = qrMatrix(text);
    let d = "";
    matrix.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) d += `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z`;
      }),
    );
    return { size: matrix.length + QUIET_ZONE * 2, path: d };
  }, [text]);

  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" className="w-full rounded-xl bg-white">
      <path d={path} fill="#000" />
    </svg>
  );
}
