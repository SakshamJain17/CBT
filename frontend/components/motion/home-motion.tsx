"use client";

import { useHeroZoom } from "./use-hero-zoom";
import { useSectionReveals } from "./use-section-reveals";

/** Scroll motion for the landing page. Renders nothing; it only wires up animations. */
export function HomeMotion() {
  useHeroZoom(); // must register first: its pin shifts every trigger below it
  useSectionReveals();
  return null;
}
