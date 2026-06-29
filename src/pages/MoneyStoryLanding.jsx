import React from "react";

/**
 * MONEY STORY LANDING  ·  public marketing page for the free Your Money Story workbook.
 * Start now and Log in enter the existing auth funnel via from_url, the same mechanic
 * StartingPointProfile uses, so a new account lands straight in /YourMoneyStory.
 * Brand tokens only (src/index.css :root). No em dashes.
 */
export default function MoneyStoryLanding() {
  const goRegister = () => { window.location.href = "/register?from_url=/YourMoneyStory"; };
  const goLogin = () => { window.location.href = "/login?from_url=/YourMoneyStory"; };

  return (
    <div className="msl-page">
      <Style />

      <header className="msl-topbar">
        <button className="msl-brand" onClick={() => { window.location.href = "/"; }} aria-label="The Aligned Woman home">
          <span className="msl-logo">AW</span>
          <span className="msl-lockup">
            <span className="msl-lockup-t">THE ALIGNED</span>
            <span className="msl-lockup-s">Woman</span>
          </span>
        </button>
        <button className="msl-login-top" onClick={goLogin}>LOG IN</button>
      </header>

      <main className="msl-main">
        <div className="msl-eyebrow">Your Money Story</div>
        <h1 className="msl-headline">
          Finally understand your <span className="msl-it">money story</span>.
        </h1>
        <p className="msl-sub">
          Why you struggle to make it. Why it slips through your fingers when you do. Why even
          thinking about it tightens something in your chest. None of that is a character flaw, and
          none of it started with you.
        </p>

        <div className="msl-pill">Neuroscience + Psychology</div>
        <p className="msl-lede">
          Using <strong>neuroscience and psychology</strong>, Your Money Story helps you understand
          how your brain is wired around money, and why that wiring could be hurting you instead of
          protecting you. You will uncover what your money story actually is, and how to rewrite it,
          so you can finally live a financially free and abundant life.
        </p>

        <div className="msl-quote">
          <span className="msl-quote-amp" aria-hidden>&amp;</span>
          <p className="msl-quote-text">
            You were never bad with money. You were handed a story very young and told it was yours.{" "}
            <span className="msl-quote-soft">But the best thing about a story is that it can be rewritten.</span>
          </p>
        </div>

        <p className="msl-ctaline"><span className="msl-it">It's free.</span> Create your account and start now.</p>
        <button className="msl-start" onClick={goRegister}>
          START NOW <span className="msl-arrow" aria-hidden>→</span>
        </button>
        <p className="msl-loginline">
          Already have an account? <button className="msl-loginlink" onClick={goLogin}>Log in</button>
        </p>
      </main>

      <footer className="msl-footer">
        <div className="msl-foot-rule" />
        <div className="msl-foot-brand">
          <span className="msl-logo msl-logo-sm">AW</span>
          <span className="msl-foot-wordmark">THE ALIGNED <span className="msl-it">Woman</span></span>
        </div>
        <div className="msl-foot-co">THE ALIGNED WOMAN CO</div>
      </footer>
    </div>
  );
}

function Style() {
  return (
    <style>{`
.msl-page{min-height:100vh;display:flex;flex-direction:column;background:var(--aw-white);font-family:var(--aw-font-sans);color:var(--aw-dark-grey)}
.msl-page *{box-sizing:border-box}
.msl-it{font-family:var(--aw-font-display);font-style:italic;color:var(--aw-rose-core)}

/* top bar */
.msl-topbar{display:flex;align-items:center;justify-content:space-between;max-width:1100px;width:100%;margin:0 auto;padding:26px 28px}
.msl-brand{display:flex;align-items:center;gap:12px;background:none;border:0;cursor:pointer;padding:0}
.msl-logo{flex:none;width:38px;height:38px;border-radius:50%;background:var(--aw-burg-core);color:var(--aw-white);display:grid;place-items:center;font-family:var(--aw-font-display);font-weight:600;font-size:14px;letter-spacing:.02em}
.msl-logo-sm{width:30px;height:30px;font-size:12px}
.msl-lockup{display:flex;flex-direction:column;line-height:1.05;text-align:left}
.msl-lockup-t{font-size:12px;font-weight:700;letter-spacing:.16em;color:var(--aw-burg-core)}
.msl-lockup-s{font-family:var(--aw-font-display);font-style:italic;font-size:15px;color:var(--aw-rose-core)}
.msl-login-top{background:none;border:0;cursor:pointer;font-family:var(--aw-font-sans);font-size:12px;font-weight:700;letter-spacing:.16em;color:var(--aw-burg-core);transition:opacity .18s}
.msl-login-top:hover{opacity:.7}

/* main column */
.msl-main{flex:1;width:100%;max-width:720px;margin:0 auto;padding:30px 28px 60px;text-align:center;display:flex;flex-direction:column;align-items:center}
.msl-eyebrow{font-size:11px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--aw-rose-core);margin:18px 0 22px}
.msl-headline{font-family:var(--aw-font-display);font-weight:400;font-size:clamp(40px,7vw,68px);line-height:1.04;color:var(--aw-burg-core);margin:0 0 26px;max-width:680px}
.msl-sub{font-size:16px;line-height:1.7;color:var(--aw-mid-grey);max-width:560px;margin:0 0 8px}

.msl-pill{display:inline-block;margin:42px 0 22px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--aw-rose-deep);background:var(--aw-rose-wash);border:1px solid var(--aw-border-rose);border-radius:var(--aw-radius-pill);padding:8px 18px}
.msl-lede{font-size:16.5px;line-height:1.75;color:var(--aw-dark-grey);max-width:600px;margin:0}
.msl-lede strong{color:var(--aw-burg-core);font-weight:700}

/* quote card */
.msl-quote{position:relative;overflow:hidden;width:100%;max-width:620px;margin:48px 0 44px;background:linear-gradient(135deg,var(--aw-burg-core) 0%,var(--aw-burg-mid) 100%);border-radius:22px;padding:56px 56px}
.msl-quote-text{position:relative;z-index:1;font-family:var(--aw-font-display);font-weight:400;font-size:clamp(22px,3.4vw,30px);line-height:1.4;color:var(--aw-white);margin:0}
.msl-quote-soft{color:var(--aw-rose-light)}
.msl-quote-amp{position:absolute;right:18px;bottom:-30px;z-index:0;font-family:var(--aw-font-display);font-style:italic;font-size:230px;line-height:1;color:rgba(255,255,255,0.08);pointer-events:none}

/* cta */
.msl-ctaline{font-family:var(--aw-font-display);font-size:clamp(22px,3.2vw,30px);color:var(--aw-burg-core);font-weight:400;margin:0 0 26px}
.msl-start{display:inline-flex;align-items:center;gap:12px;background:var(--aw-burg-core);color:var(--aw-white);border:0;cursor:pointer;border-radius:var(--aw-radius-pill);padding:17px 34px;font-family:var(--aw-font-sans);font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;transition:background .18s,transform .18s}
.msl-start:hover{background:var(--aw-burg-mid);transform:translateY(-1px)}
.msl-arrow{font-size:15px}
.msl-loginline{font-size:13.5px;color:var(--aw-mid-grey);margin:22px 0 0}
.msl-loginlink{background:none;border:0;cursor:pointer;font-family:var(--aw-font-sans);font-size:13.5px;font-weight:700;color:var(--aw-burg-core);text-decoration:none}
.msl-loginlink:hover{text-decoration:underline;text-underline-offset:3px}

/* footer */
.msl-footer{width:100%;max-width:1100px;margin:0 auto;padding:0 28px 40px;text-align:center}
.msl-foot-rule{height:1px;background:var(--aw-border-light);margin:0 0 28px}
.msl-foot-brand{display:flex;align-items:center;justify-content:center;gap:10px}
.msl-foot-wordmark{font-size:13px;font-weight:700;letter-spacing:.14em;color:var(--aw-burg-core)}
.msl-foot-co{font-size:10px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--aw-mid-grey);margin-top:10px}

@media (max-width:640px){
  .msl-quote{padding:40px 30px}
  .msl-main{padding:20px 22px 48px}
}
`}</style>
  );
}