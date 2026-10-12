"use client";

import { useEffect, useRef } from "react";

function FoxReader() {
  return (
    <svg className="fox-reader" viewBox="0 0 360 390" role="img" aria-label="A friendly fox reading a green book">
      <path className="fox-tail" d="M275 271c66-14 76 57 18 87-41 22-81 2-87-26 34 14 63-2 69-61Z" />
      <path className="fox-body" d="M113 179c30-36 105-38 137 4 24 31 26 116 6 153H98c-19-48-11-123 15-157Z" />
      <path className="fox-ear" d="m105 130 17-88 59 58M255 130l-18-88-58 58" />
      <path className="fox-head" d="M93 127c9-57 57-82 87-82s78 25 87 82c8 52-26 103-87 103S85 179 93 127Z" />
      <path className="fox-mask" d="M102 116c18 10 45 3 78-36 32 39 59 46 78 36-3 56-33 103-78 103s-75-47-78-103Z" />
      <circle cx="145" cy="137" r="7" /><circle cx="216" cy="137" r="7" />
      <path className="fox-nose" d="M169 166h23l-11 12Z" />
      <path className="fox-book-left" d="M35 242c58-16 104-7 145 29v101c-44-29-93-36-145-20V242Z" />
      <path className="fox-book-right" d="M325 242c-58-16-104-7-145 29v101c44-29 93-36 145-20V242Z" />
      <path className="book-detail" d="M180 271v101M60 268c39-7 73 0 99 18M300 268c-39-7-73 0-99 18" />
      <path className="fox-paw" d="M109 271c10-18 35-20 47-3M252 271c-10-18-35-20-47-3" />
    </svg>
  );
}

export function PopUpBook() {
  const sceneRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let frame = 0;
    const update = () => {
      const bounds = scene.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / distance));
      scene.style.setProperty("--book-progress", progress.toFixed(4));
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="book-scene" ref={sceneRef} aria-labelledby="hero-title">
      <div className="book-sticky">
        <div className="forest-glow" aria-hidden="true" />
        <p className="scene-kicker">Scroll to open the story</p>
        <div className="book-stage">
          <div className="paper-book">
            <div className="book-crease" aria-hidden="true" />
            <div className="page-sun" aria-hidden="true" />
            <div className="paper-hill hill-one" aria-hidden="true" />
            <div className="paper-hill hill-two" aria-hidden="true" />

            <div className="cutout-tree tree-left" aria-hidden="true"><i /><i /><i /><b /></div>
            <div className="cutout-tree tree-right" aria-hidden="true"><i /><i /><i /><b /></div>
            <div className="mushroom mushroom-one" aria-hidden="true"><i /><b /></div>
            <div className="mushroom mushroom-two" aria-hidden="true"><i /><b /></div>
            <div className="paper-bird bird-one" aria-hidden="true">⌁</div>
            <div className="paper-bird bird-two" aria-hidden="true">⌁</div>

            <article className="pop-panel story-panel">
              <span className="panel-number">A story is waiting</span>
              <h2>Turn curiosity<br />into discovery.</h2>
              <p>Across languages and generations, every shelf holds a new world.</p>
            </article>

            <div className="character-hero">
              <FoxReader />
              <div className="speech-bubble">Which story<br />will find you?</div>
            </div>

            <article className="pop-panel stat-panel">
              <span className="panel-number">Shelf verified</span>
              <strong>Book by book.</strong>
              <p>Availability appears only after a librarian confirms the physical copy.</p>
              <div className="story-progress"><i /></div>
            </article>
          </div>
        </div>

        <div className="hero-message">
          <p className="eyebrow"><span>01</span> Children&apos;s Book Trust · New Delhi</p>
          <h1 id="hero-title">Every book opens<br /><em>a world.</em></h1>
          <p>Explore a growing catalogue of children&apos;s stories, carefully matched to the real books on our shelves.</p>
          <a className="storybook-button" href="#catalogue">Explore the library <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}
