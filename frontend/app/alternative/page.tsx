import type { Metadata } from "next";
import Link from "next/link";
import styles from "./alternative.module.css";

export const metadata: Metadata = {
  title: "Risograph concept",
  description: "An alternative risograph-inspired concept for the Children’s Book Trust digital library.",
};

const pathways = [
  {
    number: "01",
    name: "Discover",
    kicker: "For every curious reader",
    description: "Search the public catalogue across titles, languages, authors, and subjects.",
    action: "Explore books",
    href: "/#catalogue",
    features: ["Search verified titles", "See recorded language", "Check current availability"],
  },
  {
    number: "02",
    name: "Borrow",
    kicker: "For CBT members",
    description: "Sign in to see the loans connected to your library membership.",
    action: "My library account",
    href: "/login",
    features: ["Private member access", "Current and past loans", "Clear due-date records"],
    featured: true,
  },
  {
    number: "03",
    name: "Verify",
    kicker: "For library staff",
    description: "Turn register entries into trustworthy records, one physical shelf at a time.",
    action: "Librarian portal",
    href: "/login",
    features: ["Catalogue title records", "Physical copy tracking", "Shelf verification workflow"],
  },
];

const questions = [
  ["Why does availability need verification?", "A handwritten register shows that a book entered the collection. A shelf check confirms whether a physical copy can be found and borrowed now."],
  ["Can I search without signing in?", "Yes. The public catalogue exposes approved book information while keeping member, loan, and staff records private."],
  ["What can members see?", "Signed-in members can see the borrowing records linked to their own CBT membership account."],
  ["What is this pilot testing?", "The pilot begins with a small physical section so librarians can refine entry, review, shelf checking, and public availability before expanding."],
];

function Mark() {
  return <span className={styles.mark} aria-hidden="true"><i /></span>;
}

export default function AlternativePage() {
  return (
    <main className={`riso-library ${styles.page}`}>
      <nav className={styles.nav} aria-label="Alternative concept navigation">
        <div className={styles.navInner}>
          <Link className={styles.brand} href="/alternative"><Mark /><strong>CBT LIBRARY</strong></Link>
          <div className={styles.navLinks}><a href="#pathways">Explore</a><a href="#process">How it works</a><a href="#questions">Questions</a></div>
          <div className={styles.navActions}><Link href="/login">Sign in</Link><Link className={styles.pinkButton} href="/#catalogue">Find a story</Link></div>
        </div>
      </nav>

      <div className={styles.grain} aria-hidden="true" />
      <section className={styles.hero}>
        <div className={styles.halftone} aria-hidden="true" />
        <div className={`${styles.circle} ${styles.circlePink}`} aria-hidden="true" />
        <div className={`${styles.circle} ${styles.circleBlue}`} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>CHILDREN&apos;S BOOK TRUST · NEW DELHI</p>
          <h1 className={styles.heroTitle}>Stories that <span data-t="print">print</span><br />memories, not screens.</h1>
          <p className={styles.heroIntro}>A playful digital doorway to real books, real shelves, and generations of children&apos;s stories.</p>
          <div className={styles.heroActions}><Link className={styles.inkButton} href="/#catalogue">Browse the catalogue</Link><a className={styles.underlined} href="#process">See how books are verified</a></div>
        </div>
        <div className={styles.bookStack} aria-hidden="true">
          <div className={styles.bookOne}><span>TALES</span></div>
          <div className={styles.bookTwo}><span>STORIES</span></div>
          <div className={styles.bookThree}><span>WONDER</span></div>
          <div className={styles.spark}>✦</div>
        </div>
      </section>

      <section className={styles.pathwaySection} id="pathways">
        <header className={styles.sectionHeader}><p className={styles.monoLabel}>THREE WAYS INTO THE LIBRARY</p><h2>Find your next chapter.</h2><p>Start with the public catalogue, continue through your membership, or help build trustworthy records as library staff.</p></header>
        <div className={styles.pathwayGrid}>
          {pathways.map((pathway) => (
            <article className={`${styles.pathwayCard} ${pathway.featured ? styles.featuredCard : ""}`} key={pathway.name}>
              {pathway.featured ? <span className={styles.popular}>★ MEMBER PATH</span> : null}
              <div className={styles.cardTop}><h3>{pathway.name}</h3><span className={styles.dotChip} /></div>
              <div className={styles.cardNumber}><strong>{pathway.number}</strong><span>{pathway.kicker}</span></div>
              <p>{pathway.description}</p>
              <Link className={styles.cardButton} href={pathway.href}>{pathway.action}</Link>
              <span className={styles.includes}>WHAT YOU&apos;LL FIND</span>
              <ul>{pathway.features.map((feature) => <li key={feature}><i>✓</i><span>{feature}</span></li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.languageStrip} aria-label="Languages represented in the catalogue">
        <span>STORIES ACROSS LANGUAGES</span><strong>English</strong><strong>हिन्दी</strong><strong>বাংলা</strong><strong>मराठी</strong><strong>தமிழ்</strong>
      </section>

      <section className={styles.process} id="process">
        <div className={styles.processPoster}><span>REGISTER</span><b>+</b><span>REVIEW</span><b>+</b><span>SHELF</span><b>=</b><strong>TRUST</strong></div>
        <div className={styles.processCopy}><p className={styles.monoLabel}>NO HIDDEN INK</p><h2>A catalogue that tells the truth.</h2><p>CBT&apos;s collection begins in handwritten registers and lives on physical shelves. Public availability appears only after a librarian confirms the copy itself.</p><ol><li><i>01</i> Enter the source record</li><li><i>02</i> Review the title details</li><li><i>03</i> Locate the physical copy</li><li><i>04</i> Publish verified availability</li></ol></div>
      </section>

      <section className={styles.faq} id="questions">
        <header className={styles.faqHeader}><p className={styles.monoLabel}>FREQUENTLY ASKED</p><h2>Questions before you turn the page.</h2></header>
        <div className={styles.faqGrid}>{questions.map(([question, answer]) => <article key={question}><h3><span>Q.</span> {question}</h3><p>{answer}</p></article>)}</div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaDots} aria-hidden="true" /><div className={styles.ctaPink} aria-hidden="true" /><div className={styles.ctaYellow} aria-hidden="true" />
        <div><p className={styles.monoLabel}>YOUR NEXT STORY IS WAITING</p><h2>Ready to open a real book?</h2><p>Search the verified pilot catalogue, then visit the library to meet the story on its shelf.</p><div><Link className={styles.pinkButton} href="/#catalogue">Find a story</Link><Link className={styles.paperButton} href="/login">Member sign in</Link></div></div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}><div><div className={styles.brand}><Mark /><strong>CBT LIBRARY</strong></div><p>Stories for every childhood.<br />Records verified one shelf at a time.</p></div><div><span>EXPLORE</span><Link href="/#catalogue">Catalogue</Link><a href="#process">How it works</a></div><div><span>ACCESS</span><Link href="/login">Member sign in</Link><Link href="/login">Librarian portal</Link></div><div><span>CONCEPT</span><Link href="/">Original website</Link><Link href="/alternative">Risograph alternative</Link></div></div>
        <div className={styles.footerBar}><span>© 2026 CHILDREN&apos;S BOOK TRUST</span><span>PRINTED WITH CARE, VERIFIED WITH PURPOSE</span></div>
      </footer>
    </main>
  );
}
