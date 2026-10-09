"use client";

import { FormEvent, useState } from "react";
import type { PublicCatalogueItem } from "@/lib/services/catalogue";

type SearchResult = { items: PublicCatalogueItem[]; total: number; page: number; pageSize: number };

export function CatalogueExplorer() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/catalogue?q=${encodeURIComponent(query)}&pageSize=12`);
      const payload = (await response.json()) as { data: SearchResult | null; error: { message: string } | null };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Search failed.");
      setResult(payload.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Search could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="catalogue-shell">
      <form className="search-form" onSubmit={search} role="search">
        <label htmlFor="catalogue-query">Search by title or catalogue keyword</label>
        <div className="search-row">
          <span aria-hidden="true" className="search-icon">⌕</span>
          <input id="catalogue-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “adventure”, “nature”, or a title…" autoComplete="off" />
          <button type="submit" disabled={loading}>{loading ? "Searching…" : "Search"}</button>
        </div>
      </form>
      <div className="search-status" aria-live="polite">
        {message ? <p className="error-message">{message}</p> : null}
        {result ? <p>{result.total === 0 ? "No verified titles found yet." : `${result.total} verified title${result.total === 1 ? "" : "s"}`}</p> : <p>The connected pilot catalogue is ready for its first verified records.</p>}
      </div>
      {result && result.items.length > 0 ? (
        <div className="book-grid">
          {result.items.map((book, index) => (
            <article className="book-card" key={book.id} style={{ "--book-index": index } as React.CSSProperties}>
              <div className="book-cover" aria-hidden="true"><span>{book.title.slice(0, 1)}</span></div>
              <div className="book-card-copy">
                <p className="book-meta">{book.language ?? "Language not recorded"} · {book.publication_year ?? "Year unknown"}</p>
                <h3>{book.title}</h3>
                <p>{book.authors.length > 0 ? book.authors.join(", ") : "Author not recorded"}</p>
                <span className={`availability ${book.available_copies > 0 ? "is-available" : "is-unavailable"}`}><i aria-hidden="true" />{book.available_copies > 0 ? `${book.available_copies} available` : "Currently unavailable"}</span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
