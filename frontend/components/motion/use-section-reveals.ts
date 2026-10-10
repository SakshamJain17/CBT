"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// One calm reveal for every section: fade + 24px rise, 0.7s, children 0.08s apart.
// Elements are hidden with gsap.set and revealed with .to (not .from): ScrollTrigger refreshes
// (e.g. after the hero pin) can wipe a staggered .from's start state, flashing items visible.
const HIDDEN = { autoAlpha: 0, y: 24 };
// Each element returns to its designed opacity (e.g. the footer meta's 0.6), recorded by hide().
const restOpacity = new WeakMap<Element, number>();
const rest = (_i: number, el: Element) => restOpacity.get(el) ?? 1;
const SHOW = { autoAlpha: rest, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 };

/** Plays forward as a block enters (top hits 80% of the viewport) and reverses when scrolled back above it. */
const onEnter = (trigger: Element, start = "top 80%") => ({ trigger, start, toggleActions: "play none none reverse" });

type Targets = Element[] | NodeListOf<Element> | HTMLCollection;
const toArray = (t: Targets | Element) => (t instanceof Element ? [t] : Array.from(t));

/** Hide elements before their reveal, remembering the opacity to come back to. */
function hide(targets: Targets | Element, vars: gsap.TweenVars = HIDDEN) {
  const els = toArray(targets);
  // Record once, before GSAP ever touches the element (a re-run, e.g. React dev double-mount, would read the hidden 0).
  els.forEach((el) => restOpacity.has(el) || restOpacity.set(el, +getComputedStyle(el).opacity));
  gsap.set(els, vars);
  return els;
}

function reveal(targets: Targets, trigger: Element, vars: gsap.TweenVars = {}, start?: string) {
  gsap.to(hide(targets), { ...SHOW, ...vars, scrollTrigger: onEnter(trigger, start) });
}

/** Scroll-tied version: progress follows the scrollbar between `start` and `end`, so it reverses exactly. */
const scrubbed = (trigger: Element, start: string | (() => number), end: string) => ({ trigger, start, end, scrub: 0.5 });

/**
 * Start point that never comes before the hero pin releases (on desktop Section 2 is already on screen during the pin).
 * `at` is where the element's top sits in the viewport when its reveal would normally begin (0.85 = 85% down).
 */
const afterPin = (el: Element, at: number, delay = 0) => () =>
  Math.max((ScrollTrigger.getById("hero-zoom")?.end ?? 0) + delay * innerHeight, el.getBoundingClientRect().top + scrollY - at * innerHeight);

/**
 * Entrances for Section 2 onward. Skipped entirely with reduced motion, so content shows in its final state.
 * On ≥900px Section 2's label/headline/paragraph are driven by the hero zoom (use-hero-zoom); below that, here.
 */
export function useSectionReveals() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const $ = (s: string) => document.querySelector(s);

    mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
      const statement = $(".statement");
      if (!statement) return;
      const q = gsap.utils.selector(statement);
      const opening = hide([...q(".eyebrow"), ...q(".reveal-line"), ...q(".statement-grid > div > p")]);
      // label → headline phrases → paragraph, tied to scroll as Section 2 enters
      gsap.to(opening, { ...SHOW, stagger: 0.14, ease: "none", scrollTrigger: scrubbed(statement, "top 85%", "top 35%") });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const principles = $(".principles");
      if (principles) {
        hide(principles, { autoAlpha: 0 }); // hides the list's top border too, until the steps arrive
        const steps = hide(principles.children, { ...HIDDEN, "--draw": 0 });
        // steps one by one, each divider drawing left to right, tied to scroll
        gsap.timeline({ scrollTrigger: scrubbed(principles, afterPin(principles, 0.85), "+=35%") })
          .to(principles, { autoAlpha: rest, duration: 0.1 })
          .to(steps, { ...SHOW, stagger: 0.12 }, 0)
          .to(steps, { "--draw": 1, duration: 0.8, ease: "power2.inOut", stagger: 0.12 }, 0);
      }

      const strip = $(".trust-strip");
      if (strip) {
        hide(strip, { autoAlpha: 0 }); // the strip's own borders stay hidden until the boxes come in
        const boxes = hide(strip.children);
        gsap.timeline({ scrollTrigger: scrubbed(strip, afterPin(strip, 0.9, 0.15), "+=30%") })
          .to(strip, { autoAlpha: rest, duration: 0.1 })
          .to(boxes, { ...SHOW }, 0);
      }

      const catalogue = $(".catalogue-section");
      if (catalogue) reveal(catalogue.querySelectorAll(".section-heading > *, .search-form, .search-status"), catalogue);

      const manifesto = $(".manifesto");
      if (manifesto) reveal(manifesto.querySelectorAll(".eyebrow, .manifesto-line"), manifesto, { stagger: 0.15 });

      const footer = $(".site-footer");
      if (footer) reveal(footer.children, footer, {}, "top 95%");
    });

    return () => mm.revert();
  }, []);
}
