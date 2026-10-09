import { CatalogueExplorer } from "@/components/catalogue-explorer";

const orbitLabels = ["English", "हिन्दी", "বাংলা", "मराठी", "தமிழ்"];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" />
          <div className="book-sun"><span>CBT</span></div>
          {orbitLabels.map((label, index) => <span className={`orbit-label orbit-label-${index + 1}`} key={label}>{label}</span>)}
        </div>
        <div className="hero-copy">
          <div className="pilot-status"><i aria-hidden="true" /> Verified pilot catalogue · New Delhi</div>
          <p className="eyebrow"><span>01</span> India’s stories, easier to find</p>
          <h1>Find the story.<br /><em>Know it’s there.</em></h1>
          <p className="hero-intro">Discover children’s books across languages and generations. Every availability shown here is tied to a physical copy that CBT librarians have actually verified.</p>
          <a className="primary-link" href="#catalogue">Search the library <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-index" aria-hidden="true"><span>EST.</span><strong>1957</strong><span>NEW DELHI</span></div>
      </section>

      <section className="statement" id="about">
        <p className="eyebrow"><span>02</span> A careful digital beginning</p>
        <div className="statement-grid">
          <h2>Not just digitised.<br /><em>Physically verified.</em></h2>
          <div>
            <p>CBT’s collection lives in handwritten registers and on real shelves. This pilot begins with a small section, checked book by book.</p>
            <dl className="principles">
              <div><dt>01</dt><dd>Register entry</dd></div><div><dt>02</dt><dd>Librarian review</dd></div>
              <div><dt>03</dt><dd>Shelf verification</dd></div><div><dt>04</dt><dd>Public availability</dd></div>
            </dl>
          </div>
        </div>
        <div className="trust-strip" aria-label="Catalogue principles">
          <span>01 · Human entered</span><span>02 · Shelf checked</span><span>03 · Clearly dated</span><span>04 · Privacy protected</span>
        </div>
      </section>

      <section className="catalogue-section" id="catalogue">
        <div className="section-heading"><p className="eyebrow"><span>03</span> Explore the collection</p><p className="section-note">Searches only confirmed public catalogue records.</p></div>
        <CatalogueExplorer />
      </section>

      <section className="manifesto">
        <p className="eyebrow"><span>04</span> Built for trust</p>
        <p className="manifesto-line">A register tells us a book <em>once existed.</em></p>
        <p className="manifesto-line offset">A librarian tells us <em>where it is now.</em></p>
      </section>
    </main>
  );
}
