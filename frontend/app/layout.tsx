import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: { default: "CBT Library", template: "%s · CBT Library" },
  description: "Search the physically verified Children’s Book Trust library catalogue.",
};

function Mark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="brand-mark">
      <path d="M7 9.5c6-2.2 11.7-.8 17 3.7v27C18.7 35.4 13 34 7 36.2V9.5Z" />
      <path d="M41 9.5c-6-2.2-11.7-.8-17 3.7v27c5.3-4.8 11-6.2 17-4V9.5Z" />
      <path d="M24 13.2v27" />
    </svg>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Children’s Book Trust Library home">
            <Mark />
            <span><strong>Children’s Book Trust</strong><small>Digital Library · New Delhi</small></span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link href="/#catalogue">Catalogue</Link>
            <Link href="/#about">About the pilot</Link>
            <Link className="nav-cta" href="/login">Librarian portal <span aria-hidden="true">↗</span></Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div><Mark /><p>Stories for every childhood.<br />Records verified one shelf at a time.</p></div>
          <div className="footer-meta"><span>Children’s Book Trust</span><span>New Delhi, India</span><span>Digital catalogue pilot · 2026</span></div>
        </footer>
      </body>
    </html>
  );
}
