import React from "react";
import { Link } from "react-router-dom";

const BASK = "'Libre Baskerville', Georgia, serif";
const MONT = "Montserrat, sans-serif";

const NAV = {
  EXPLORE: [
    { label: "Home", href: "/" },
    { label: "Our Why", href: "/OurWhy" },
    { label: "The Blueprint", href: "/blueprint" },
  ],
  ABOUT: [
    { label: "About Us", href: "/about-us" },
    { label: "Contact", href: "/Contact" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Giveaway T&Cs", href: "/competition" },
  ],
  SOCIAL: [
    { label: "Instagram", href: "https://www.instagram.com/alignedwoman_co/" },
    { label: "YouTube", href: "https://www.youtube.com/@AlignedWomanCo" },
    { label: "Email", href: "mailto:hello@alignedwoman.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/the-aligned-woman/" },
  ],
};

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#f9f6f2", borderTop: "2px solid #4a2c2e", padding: "clamp(56px,7vw,80px) clamp(24px,6vw,80px) clamp(32px,4vw,48px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "start" }} className="footer-grid">

          {/* Brand */}
          <div>
            <img
              src="https://media.base44.com/images/public/69f46886a412ee042303f1af/1c0c68566_awblogo.png"
              alt="The Aligned Woman Co."
              style={{ height: 40, width: "auto", objectFit: "contain", marginBottom: 18 }}
            />
            <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "#4a2c2e", maxWidth: 240, opacity: 0.85 }}>
              Built for women. Grounded in evidence. Verified at every step.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(NAV).map(([col, links]) => (
            <div key={col}>
              <p style={{ fontFamily: MONT, fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4a2c2e", marginBottom: 26 }}>
                {col}
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("mailto") ? (
                      <a href={l.href} style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, color: "#4a2c2e", opacity: 0.7, textDecoration: "none", transition: "opacity 0.2s ease" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
                        {l.label}
                      </a>
                    ) : l.href.startsWith("#") ? (
                      <a href={l.href} style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, color: "#4a2c2e", opacity: 0.7, textDecoration: "none", transition: "opacity 0.2s ease" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} style={{ fontFamily: MONT, fontWeight: 300, fontSize: 14, color: "#4a2c2e", opacity: 0.7, textDecoration: "none", transition: "opacity 0.2s ease" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #d1ccc5", marginTop: "clamp(40px,5vw,56px)", paddingTop: 24, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 16 }} className="footer-bottom">
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 12, color: "#4a2c2e", opacity: 0.6, margin: 0 }}>
            © {year} The Aligned Woman Co. All rights reserved.
          </p>
          <p style={{ fontFamily: MONT, fontWeight: 300, fontSize: 12, color: "#4a2c2e", opacity: 0.6, margin: 0 }}>
            Designed for women. Built with intention.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}