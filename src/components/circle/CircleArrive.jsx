import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BTN_PRIMARY, BTN_SECONDARY, HostCard, TrustChips, FinePrint, RulesModal, RoomTitle,
} from "@/components/circle/CircleShell";
import CircleScheduleLine from "@/components/circle/CircleScheduleLine";
import CircleAnnounceBanner from "@/components/circle/CircleAnnounceBanner";

// ────────────────────────────────────────────────────────────────
// Arriving · Section A. One address, four states, the same header
// above every one. Nothing from inside the room is visible here: no
// posts, no members, no counts.
// ────────────────────────────────────────────────────────────────

const H1 = "font-display text-[29px] md:text-[34px] leading-[1.22] text-awburg-dark m-0";
const P = "font-body font-light text-[14.5px] md:text-[15px] leading-[1.65] text-awburg-dark m-0";
const EM = "italic text-awburg-bright";

function Check({ checked, onChange, id, children }) {
  return (
    <label htmlFor={id} className="flex items-start gap-[14px] min-h-[48px] cursor-pointer">
      <input id={id} type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden="true" className={`flex-none mt-[2px] w-[26px] h-[26px] rounded-full border-[1.5px] flex items-center justify-center font-body text-[13px] font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-awrose-deep ${checked ? "bg-awburg-core border-awburg-core text-paper" : "border-awburg-core/30 bg-paper text-transparent"}`}>
        {"✓"}
      </span>
      <span className="font-body text-[14.5px] leading-[1.6] text-awburg-dark pt-[2px]">{children}</span>
    </label>
  );
}

export function Pitch({ group, host, slug }) {
  const business = host?.business_name || host?.name || "the host";
  const first = host?.first_name || "the host";
  return (
    <div className="px-[22px] pt-7 pb-[26px] md:px-10 md:pt-12 md:pb-14 md:max-w-[1100px] md:mx-auto md:grid md:grid-cols-[1fr_360px] md:gap-14 md:items-start">
      <div className="flex flex-col gap-[18px]">
        <h2 className={H1}>
          A private room for the questions you cannot ask <em className={EM}>anywhere else</em>.
        </h2>
        <p className={P}>
          Not on WhatsApp. Not on Instagram. A closed circle of women of culture talking honestly about hormones, periods, perimenopause and everything in between. Sign up with your real name, then post anonymously if you want to. Women only, approved by {first}.
        </p>
        <TrustChips className="md:hidden" />
        <HostCard host={host} className="md:hidden" />
        <Link to={`/register?from_url=/${slug}`} className={BTN_PRIMARY}>Join the Circle</Link>
        <Link to={`/login?from_url=/${slug}`} className={BTN_SECONDARY}>Log in</Link>
        <FinePrint host={host} className="mt-[2px]" />
      </div>
      <aside className="hidden md:flex flex-col gap-[18px]">
        <HostCard host={host} />
        {group.description && (
          <p className="font-body font-light text-[13.5px] leading-[1.7] text-awburg-dark px-1">{group.description}</p>
        )}
        <TrustChips />
        <span className="sr-only">{business}</span>
      </aside>
    </div>
  );
}

export function JoinGate({ group, host, onRequest, busy, error }) {
  const [woman, setWoman] = useState(false);
  const [rules, setRules] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const first = host?.first_name || "the host";
  const canSend = woman && rules && !busy;

  return (
    <div className="px-[22px] pt-7 pb-[26px] md:px-10 md:pt-12 md:pb-14 md:max-w-[560px] md:mx-auto flex flex-col gap-[18px]">
      <h2 className={H1}>Before you step into <em className={EM}>the Circle</em>.</h2>
      <HostCard host={host} />
      <div className="flex flex-col gap-2 py-1">
        <Check id="gate-woman" checked={woman} onChange={setWoman}>I identify as a woman.</Check>
        <Check id="gate-rules" checked={rules} onChange={setRules}>
          I agree to the Circle rules.{" "}
          <button type="button" className="underline underline-offset-4 text-awburg-bright font-semibold" onClick={(e) => { e.preventDefault(); setRulesOpen(true); }}>
            Read the rules
          </button>
        </Check>
      </div>
      {error && <p className="font-body text-[12.5px] text-awrose-deep">{error}</p>}
      <button type="button" className={BTN_PRIMARY} disabled={!canSend} onClick={() => onRequest()}>
        {busy ? "Sending..." : "Request to join"}
      </button>
      <p className="font-body font-light text-[12.5px] leading-[1.6] text-awburg-mid text-center">
        Nothing in the Circle is visible until {first} approves your request.
      </p>
      <FinePrint host={host} />
      <RulesModal open={rulesOpen} rules={group.rules_text} onClose={() => setRulesOpen(false)} onAgree={() => setRules(true)} />
    </div>
  );
}

export function Pending({ host, schedule, announcement }) {
  const first = host?.first_name || "the host";
  return (
    <div className="px-[22px] pt-9 pb-10 md:px-10 md:pt-16 md:pb-20 md:max-w-[480px] md:mx-auto flex flex-col gap-4 md:text-center">
      <h2 className={H1}>Your request is <em className={EM}>with {first}</em>.</h2>
      <p className={P}>She approves every member herself, so this can take a little time. We will email you the moment you are in.</p>
      <p className="font-body font-light text-[13px] leading-[1.65] text-awburg-mid">Nothing in the Circle is visible until then. You can safely close this page.</p>
      {/* She can see when the room next meets. She does not see the live line
          (she cannot step in yet) and never an away notice. */}
      <div className="w-full md:max-w-[400px] md:mx-auto flex flex-col gap-3 pt-1 text-left">
        <CircleScheduleLine schedule={schedule} host={host} showLive={false} />
        {announcement && <CircleAnnounceBanner announcement={announcement} host={host} readOnly />}
      </div>
    </div>
  );
}

export function Declined({ group }) {
  return (
    <div className="px-[22px] pt-9 pb-10 md:px-10 md:pt-16 md:pb-20 md:max-w-[480px] md:mx-auto flex flex-col gap-4 md:text-center md:items-center">
      <h2 className={H1}>The Circle is not open on your account <em className={EM}>right now</em>.</h2>
      <p className={P}>Every request is reviewed one at a time, and this one has not been approved. If you think something went wrong, we are happy to look.</p>
      <Link to="/Support" className={`${BTN_SECONDARY} md:w-auto md:px-[34px]`}>Talk to support</Link>
      <span className="sr-only"><RoomTitle name={group.name} /></span>
    </div>
  );
}