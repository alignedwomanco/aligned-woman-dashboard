import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const OLIVE = "#4F5636";
const OLIVE_DEEP = "#314323";
const OLIVE_TEXT = "#E8E0CB";
const SAND = "#FAF5F3";
const ROSE_SOFT = "#E8B4AE";
const BURG = "#4A0E2E";

const serif = "'Baskervville', 'DM Serif Display', Georgia, serif";
const sans = "'Montserrat', system-ui, sans-serif";

export default function InterestModal({ open, onClose }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setDone(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, number and email.");
      return;
    }
    const [first_name, ...rest] = fullName.trim().split(/\s+/);
    const last_name = rest.join(" ");
    setSubmitting(true);
    try {
      await base44.entities.ContactSubmission.create({
        type: "general",
        first_name: first_name || fullName.trim(),
        last_name,
        email: email.trim(),
        extra_field_label: "Phone",
        extra_field_value: phone.trim(),
        message: "New Year Reset · Register your interest",
        status: "new",
      });
      setDone(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="aw-interest-overlay" role="dialog" aria-modal="true" aria-label="Register your interest">
      <style>{`
        .aw-interest-overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: rgba(8,1,5,0.6);
          animation: awFade 200ms ease-out;
        }
        @keyframes awFade { from { opacity: 0; } to { opacity: 1; } }
        .aw-interest-card {
          position: relative; width: 100%; max-width: 460px;
          background: ${SAND}; color: ${BURG};
          border-radius: 14px; padding: 40px 36px 36px;
          box-shadow: 0 24px 60px rgba(8,1,5,0.28);
          font-family: ${sans};
          animation: awPop 240ms cubic-bezier(0.2,0.7,0.2,1);
        }
        @keyframes awPop { from { transform: translateY(12px) scale(0.98); opacity: 0; } to { transform: none; opacity: 1; } }
        .aw-interest-close {
          position: absolute; top: 14px; right: 14px;
          width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer; color: ${BURG};
          border-radius: 50%; transition: background 180ms ease;
        }
        .aw-interest-close:hover { background: rgba(74,14,46,0.08); }
        .aw-interest-eyebrow {
          font-size: 10px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase; color: ${OLIVE_DEEP}; margin: 0 0 10px;
        }
        .aw-interest-title {
          font-family: ${serif}; font-weight: 400; font-size: 30px;
          line-height: 1.15; color: ${BURG}; margin: 0 0 8px;
        }
        .aw-interest-sub {
          font-size: 14px; font-weight: 400; line-height: 1.6;
          color: rgba(42,34,38,0.78); margin: 0 0 24px; max-width: 42ch;
        }
        .aw-interest-field { margin-bottom: 16px; }
        .aw-interest-label {
          display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: ${OLIVE_DEEP}; margin-bottom: 6px;
        }
        .aw-interest-input {
          width: 100%; box-sizing: border-box;
          padding: 13px 14px; font-family: ${sans}; font-size: 15px;
          color: ${BURG}; background: #fff;
          border: 1px solid rgba(74,14,46,0.18); border-radius: 8px;
          outline: none; transition: border-color 180ms ease, box-shadow 180ms ease;
        }
        .aw-interest-input:focus {
          border-color: ${OLIVE}; box-shadow: 0 0 0 3px rgba(79,86,54,0.14);
        }
        .aw-interest-submit {
          width: 100%; margin-top: 6px; padding: 15px 24px;
          font-family: ${sans}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.22em; text-transform: uppercase; color: ${SAND};
          background: ${OLIVE_DEEP}; border: 1.5px solid ${OLIVE_DEEP};
          border-radius: 100px; cursor: pointer;
          transition: background 220ms ease, transform 220ms ease;
        }
        .aw-interest-submit:hover:not(:disabled) { background: #25331A; }
        .aw-interest-submit:active:not(:disabled) { transform: scale(0.97); }
        .aw-interest-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .aw-interest-error {
          margin: 0 0 14px; font-size: 13px; color: #B3261E; font-weight: 500;
        }
        .aw-interest-success { text-align: center; padding: 8px 4px; }
        .aw-interest-success h3 {
          font-family: ${serif}; font-weight: 400; font-size: 28px;
          color: ${BURG}; margin: 0 0 12px;
        }
        .aw-interest-success p {
          font-size: 15px; line-height: 1.6; color: rgba(42,34,38,0.8); margin: 0 0 24px;
        }
        .aw-interest-success button {
          padding: 13px 30px; font-family: ${sans}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.22em; text-transform: uppercase; color: ${SAND};
          background: ${OLIVE_DEEP}; border: none; border-radius: 100px; cursor: pointer;
        }
        @media (max-width: 560px) {
          .aw-interest-overlay { padding: 0; align-items: flex-end; }
          .aw-interest-card {
            max-width: 100%; border-radius: 18px 18px 0 0;
            padding: 36px 24px 28px;
          }
          .aw-interest-title { font-size: 26px; }
        }
      `}</style>

      <div className="aw-interest-overlay-inner" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="aw-interest-card">
          <button type="button" className="aw-interest-close" aria-label="Close" onClick={handleClose}>
            <X size={20} />
          </button>

          {done ? (
            <div className="aw-interest-success">
              <h3>Thank you</h3>
              <p>Your interest has been registered. We will be in touch with more details soon.</p>
              <button type="button" onClick={handleClose}>Close</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="aw-interest-eyebrow">New Year Reset · Cape Town, November 2026</p>
              <h3 className="aw-interest-title">Register your interest</h3>
              <p className="aw-interest-sub">
                Leave your details and we will send you the full invitation as soon as it opens.
              </p>

              {error && <p className="aw-interest-error">{error}</p>}

              <div className="aw-interest-field">
                <label className="aw-interest-label" htmlFor="aw-i-name">Full name</label>
                <input
                  id="aw-i-name" className="aw-interest-input" type="text"
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name" placeholder="Your full name" />
              </div>

              <div className="aw-interest-field">
                <label className="aw-interest-label" htmlFor="aw-i-phone">Number</label>
                <input
                  id="aw-i-phone" className="aw-interest-input" type="tel"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel" placeholder="Contact number" />
              </div>

              <div className="aw-interest-field">
                <label className="aw-interest-label" htmlFor="aw-i-email">Email address</label>
                <input
                  id="aw-i-email" className="aw-interest-input" type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" placeholder="you@email.com" />
              </div>

              <button type="submit" className="aw-interest-submit" disabled={submitting}>
                {submitting ? "Sending…" : "Register interest"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}