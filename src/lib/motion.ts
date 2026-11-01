import type { CSSProperties } from "react";

/** Props that fade an element in as it scrolls into view (see [data-reveal] in globals.css). `index` staggers grid items. */
export function reveal(index = 0, variant?: "scale") {
  return {
    "data-reveal": variant ?? "",
    style: { "--i": Math.min(index, 6) } as CSSProperties,
  };
}
