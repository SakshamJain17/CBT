import { CatalogueExplorer } from "@/components/catalogue-explorer";
import { PopUpBook } from "@/components/pop-up-book";

export default function HomePage() {
  return (
    <main>
      <PopUpBook />

      <section className="statement" id="about">
        <p className="eyebrow"><span>02</span> The journey from register to reader</p>
        <div className="statement-grid">
          <h2>Every title has<br /><em>a paper trail.</em></h2>
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
        <p className="eyebrow"><span>04</span> The story continues</p>
        <p className="manifesto-line">A register remembers <em>every arrival.</em></p>
        <p className="manifesto-line offset">A librarian helps it find <em>its next reader.</em></p>
      </section>
    </main>
  );
}
