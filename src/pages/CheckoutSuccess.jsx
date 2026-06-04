import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const SUPPORT_EMAIL = "hello@alignedwomanco.com";
const DASHBOARD_PATH = "/Dashboard";
const SESSION_KEY = "aw_checkout_session_id";
const LOGIN_FLAG = "aw_checkout_login_tried";

function readStorage(key) {
  try {
    return window.sessionStorage.getItem(key) || "";
  } catch (_err) {
    return "";
  }
}

function writeStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch (_err) {
    // storage unavailable, fall back to the URL only
  }
}

function clearStorage(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (_err) {
    // nothing to do
  }
}

function goToLogin() {
  clearStorage(LOGIN_FLAG);
  base44.auth.redirectToLogin(window.location.href);
}

function Eyebrow({ children }) {
  return (
    <p className="text-awrose-core text-xs font-body uppercase tracking-eyebrow mb-5">
      {children}
    </p>
  );
}

function PrimaryButton({ href, onClick, children }) {
  const cls =
    "inline-flex items-center justify-center rounded-full bg-awburg-core text-white font-body text-sm tracking-wide px-8 py-3 transition-opacity hover:opacity-90 cursor-pointer";
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function SupportLink() {
  return (
    <a
      href={"mailto:" + SUPPORT_EMAIL}
      className="text-awrose-core text-sm font-body underline underline-offset-4"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}

export default function CheckoutSuccess() {
  const [status, setStatus] = useState("verifying");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function callVerify(sessionId) {
      const res = await base44.functions.invoke("verifyCheckoutSession", {
        session_id: sessionId,
      });
      return (res && res.data) || {};
    }

    async function run() {
      const params = new URLSearchParams(window.location.search);
      let sessionId = params.get("session_id") || "";

      if (sessionId && sessionId !== "{CHECKOUT_SESSION_ID}") {
        writeStorage(SESSION_KEY, sessionId);
      } else {
        sessionId = readStorage(SESSION_KEY);
      }

      if (!sessionId || sessionId === "{CHECKOUT_SESSION_ID}") {
        if (active) setStatus("unconfirmed");
        return;
      }

      // Make sure the buyer is signed in. Paying on Stripe does not sign a
      // person into the app, so we send them through the sign-in screen once,
      // keeping the session id so it survives the round trip.
      let user = null;
      try {
        user = await base44.auth.me();
      } catch (_err) {
        user = null;
      }

      if (!user) {
        if (readStorage(LOGIN_FLAG) !== "1") {
          writeStorage(LOGIN_FLAG, "1");
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        if (active) setStatus("needsignin");
        return;
      }

      clearStorage(LOGIN_FLAG);

      try {
        let data;
        try {
          data = await callVerify(sessionId);
        } catch (err) {
          const ed = (err && (err.response?.data || err.data)) || {};
          if (ed.reason === "not_authenticated") {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            data = await callVerify(sessionId);
          } else if (ed.conflict) {
            if (active) setStatus("conflict");
            return;
          } else {
            throw err;
          }
        }

        if (!active) return;
        if (data.hasAccess) {
          clearStorage(SESSION_KEY);
          setStatus("granted");
        } else if (data.conflict) {
          setStatus("conflict");
        } else {
          setStatus("unconfirmed");
        }
      } catch (err) {
        if (!active) return;
        const ed = (err && (err.response?.data || err.data)) || {};
        if (ed.conflict) {
          setStatus("conflict");
        } else {
          setStatus("unconfirmed");
        }
      }
    }

    setStatus("verifying");
    run();

    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <div className="min-h-screen w-full bg-white font-body flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="font-display text-awburg-core text-lg mb-12">
          The Aligned <span className="italic">Woman</span> Co
        </p>

        {status === "verifying" && (
          <div>
            <Eyebrow>One moment</Eyebrow>
            <h1 className="font-display text-awburg-core text-3xl leading-tight mb-8">
              Confirming your place
            </h1>
            <div
              className="mx-auto h-8 w-8 rounded-full border-2 border-awrose-core border-t-transparent animate-spin"
              aria-label="Loading"
            />
          </div>
        )}

        {status === "granted" && (
          <div>
            <Eyebrow>Welcome</Eyebrow>
            <h1 className="font-display text-awburg-core text-4xl leading-tight mb-5">
              You are in.
            </h1>
            <p className="text-awburg-core text-base leading-relaxed mb-8">
              Your place in The Aligned{" "}
              <span className="font-display italic">Woman</span> Blueprint is
              confirmed. This is the education you should have been given, and
              it is open to you now.
            </p>
            <PrimaryButton href={DASHBOARD_PATH}>
              Enter the Blueprint
            </PrimaryButton>
          </div>
        )}

        {status === "needsignin" && (
          <div>
            <Eyebrow>One last step</Eyebrow>
            <h1 className="font-display text-awburg-core text-3xl leading-tight mb-5">
              Sign in to unlock your place
            </h1>
            <p className="text-awburg-core text-base leading-relaxed mb-8">
              Your payment is confirmed. Sign in with the same email you paid
              with and your Blueprint opens straight away. No separate sign up
              needed, just continue with Google or Apple.
            </p>
            <div className="flex flex-col items-center gap-4">
              <PrimaryButton onClick={goToLogin}>
                Sign in to unlock
              </PrimaryButton>
              <SupportLink />
            </div>
          </div>
        )}

        {status === "conflict" && (
          <div>
            <Eyebrow>Already claimed</Eyebrow>
            <h1 className="font-display text-awburg-core text-3xl leading-tight mb-5">
              This purchase is linked to another account
            </h1>
            <p className="text-awburg-core text-base leading-relaxed mb-8">
              It looks like this payment has already unlocked access on a
              different account. Sign in with the one you first used, or email
              us and we will put it right.
            </p>
            <div className="flex flex-col items-center gap-4">
              <PrimaryButton href={DASHBOARD_PATH}>Go to sign in</PrimaryButton>
              <SupportLink />
            </div>
          </div>
        )}

        {status === "unconfirmed" && (
          <div>
            <Eyebrow>Almost there</Eyebrow>
            <h1 className="font-display text-awburg-core text-3xl leading-tight mb-5">
              We could not confirm your payment yet
            </h1>
            <p className="text-awburg-core text-base leading-relaxed mb-8">
              If you have just paid, give it a moment and try again. If it keeps
              happening, email us with the address you paid with and we will
              sort it out straight away.
            </p>
            <div className="flex flex-col items-center gap-4">
              <PrimaryButton onClick={() => setAttempt((a) => a + 1)}>
                Try again
              </PrimaryButton>
              <SupportLink />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
