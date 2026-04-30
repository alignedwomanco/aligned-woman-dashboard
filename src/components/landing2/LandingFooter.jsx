import React from "react";
import { Link } from "react-router-dom";

const NAV = {
  EXPLORE: [
    { label: "Home", href: "/" },
    { label: "Our Why", href: "/OurWhy" },
    { label: "The Blueprint", href: "/blueprint" },
    { label: "Journal", href: "/Journal" },
  ],
  ABOUT: [
    { label: "About Us", href: "/about-us" },
    { label: "Contact", href: "/Contact" },
    { label: "Press", href: "/Contact" },
    { label: "Terms & Conditions", href: "/termsAndconditions" },
  ],
  SOCIAL: [
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "Email", href: "mailto:hello@alignedwoman.com" },
    { label: "LinkedIn", href: "#" },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="px-6 py-20" style={{ background: "linear-gradient(180deg, #0f0308 0%, #1a0510 100%)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <p
              className="italic text-2xl mb-3"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#C4866C" }}
            >
              The Aligned Woman
            </p>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              An education for modern women. Built on honesty, evidence, and embodiment.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(NAV).map(([col, links]) => (
            <div key={col}>
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-6" style={{ color: "#C4866C" }}>
                {col}
              </p>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("mailto") ? (
                      <a href={l.href} className="text-white/40 text-sm hover:text-white/80 transition-colors">
                        {l.label}
                      </a>
                    ) : l.href.startsWith("#") ? (
                      <a href={l.href} className="text-white/40 text-sm hover:text-white/80 transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="text-white/40 text-sm hover:text-white/80 transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-white/25 text-xs tracking-wide">
            © {new Date().getFullYear()} The Aligned Woman Co. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Designed for women. Built with intention.
          </p>
        </div>
      </div>
    </footer>
  );
}