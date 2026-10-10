"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PAPER = "#eeeadd"; // Section 2 background (--paper)

/** Scale at which the CBT circle covers the whole hero, measured from its centre to the farthest corner. */
function coverScale(hero: HTMLElement, orbit: HTMLElement, sun: HTMLElement) {
  const h = hero.getBoundingClientRect();
  const o = orbit.getBoundingClientRect(); // circle sits at the orbit's centre
  const cx = o.left + o.width / 2 - h.left;
  const cy = o.top + o.height / 2 - h.top;
  const far = Math.max(Math.hypot(cx, cy), Math.hypot(h.width - cx, cy), Math.hypot(cx, h.height - cy), Math.hypot(h.width - cx, h.height - cy));
  return ((far * 2) / sun.offsetWidth) * 1.06; // +6%: the blob shape isn't a perfect circle
}

/**
 * Hero → Section 2 transition.
 * ≥900px: hero pins for 130% of the viewport; the circle zooms to fill it and turns cream, becoming Section 2's background.
 *   Section 2 is pulled up to overlap the pinned hero, so its top meets the viewport top exactly as the pin releases,
 *   and its opening (label → headline → paragraph) fades in over the last 30% of the zoom.
 * <900px: no pin; the circle grows ~2.5× and fades as the hero scrolls away.
 * Reduced motion: nothing is registered, so the page stays static.
 */
export function useHeroZoom() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const hero = document.querySelector<HTMLElement>(".hero");
    const orbit = hero?.querySelector<HTMLElement>(".hero-orbit");
    const sun = hero?.querySelector<HTMLElement>(".book-sun");
    const statement = document.querySelector<HTMLElement>(".statement");
    if (!hero || !orbit || !sun || !statement) return;

    const q = gsap.utils.selector(hero);
    const s2 = gsap.utils.selector(statement);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      // Overlap: Section 2 sits on top of the pinned hero (transparent — the body behind it is the same --paper),
      // shifted up by the hero's height so there's no empty cream screen after the pin. Re-measured on every refresh.
      const overlap = () => gsap.set(statement, { marginTop: -hero.offsetHeight });
      gsap.set(statement, { position: "relative", zIndex: 1, backgroundColor: "transparent" });
      // Section 2 can be shorter than the hero it overlaps, so the next section must also sit above the (cream) hero.
      gsap.set(statement.nextElementSibling, { position: "relative", zIndex: 1 });
      overlap();
      ScrollTrigger.addEventListener("refreshInit", overlap);

      const [label, line1, line2, para] = [s2(".eyebrow"), s2(".reveal-line")[0], s2(".reveal-line")[1], s2(".statement-grid > div > p")];
      gsap.set([label, line1, line2, para], { autoAlpha: 0, y: 24 });
      const rise = { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" };

      // Timeline length is 1, so positions below read as fractions of the pinned scroll.
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "hero-zoom", trigger: hero, start: "top top", end: "+=130%", pin: true, scrub: 0.5, invalidateOnRefresh: true,
          // Section 2 covers the hero while pinned; let clicks reach the hero's button until the pin releases.
          onToggle: (self) => gsap.set(statement, { pointerEvents: self.isActive ? "none" : "" }),
        },
      })
        .to(q(".hero-copy"), { autoAlpha: 0, y: -40, duration: 0.35 }, 0) // text drifts up and out
        .to(q(".hero-index, .hero-grid"), { autoAlpha: 0, duration: 0.3 }, 0)
        .to(q(".orbit-spin"), { rotation: 25, autoAlpha: 0, duration: 0.5 }, 0) // rings + labels turn away
        .to(q(".book-sun span"), { autoAlpha: 0, duration: 0.25 }, 0)
        .to(sun, { "--spine": 0, duration: 0.25 }, 0) // spine lines (pseudo-elements) would otherwise scale into stripes
        .to(q(".sun-zoom"), { scale: () => coverScale(hero, orbit, sun), duration: 0.7, ease: "power1.in" }, 0.05) // circle fills the hero
        .to(sun, { backgroundColor: PAPER, boxShadow: "0 0 0px rgba(232,182,80,0)", duration: 0.3 }, 0.6) // gold → cream
        .to(hero, { borderBottomColor: "rgba(255,253,245,0)", duration: 0.3 }, 0.6) // hide the hero's hairline: Firefox paints it over the zoomed circle
        // Section 2 opening builds on the cream as the zoom finishes
        .to(label, rise, 0.7)
        .to(line1, rise, 0.75)
        .to(line2, rise, 0.8)
        .to(para, rise, 0.85)
        .to({}, { duration: 0.03 }, 0.97); // keeps the timeline length at exactly 1

      return () => ScrollTrigger.removeEventListener("refreshInit", overlap);
    });

    mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 } })
        .to(q(".hero-copy, .hero-index"), { autoAlpha: 0, y: -40, duration: 0.6 }, 0)
        .to(q(".orbit-spin"), { rotation: 25, autoAlpha: 0, duration: 0.6 }, 0)
        .to(q(".sun-zoom"), { scale: 2.5, autoAlpha: 0, duration: 1 }, 0);
    });

    return () => mm.revert();
  }, []);
}
