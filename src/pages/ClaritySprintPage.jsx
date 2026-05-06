import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

const TESTIMONIALS = [
  { name: "Tasha Berrings", role: "Founder, Cape Town", quote: "I came into the Clarity Sprint feeling like I was running in circles. Four weeks later I had a written strategic plan, a repositioned offer, and for the first time in two years, I knew exactly what I was doing and why. Laura does not do fluff. She does outcomes." },
  { name: "Tharunisa Reddy", role: "Senior Manager, Johannesburg", quote: "I was skeptical because I had done coaching before and it always felt like a lot of talking without much direction. This was completely different. Laura's methodology is structured and rigorous. I left every call with something written. By week four I had a vision document I still use daily." },
  { name: "Vanessa Rathbone", role: "Creative Director, Durban", quote: "The diagnostic alone was worth the investment. Laura identified a pattern in my decision-making that I had never seen before. Once I could see it, everything else started to unlock. The sprint gave me the language to understand my own story." },
  { name: "Iris Smyth", role: "Consultant, London", quote: "I booked the Clarity Sprint during a period of real professional confusion. I had achievements on paper but felt completely lost. Laura helped me separate what I had been performing from what I actually wanted. It was uncomfortable and completely necessary." },
  { name: "Elena Sterling", role: "Executive, Pretoria", quote: "Laura is the only coach I have worked with who brings a genuine strategic lens to personal development. She is not interested in how you feel about something. She is interested in what you are going to do about it. That is exactly what I needed." },
  { name: "Ashleigh Carter", role: "Entrepreneur, Stellenbosch", quote: "Four weeks felt short but Laura made every minute count. The workbook she designed for the sprint is exceptional. I came in overwhelmed and left with a 30-day action plan that was actually calibrated to my real capacity. Nothing vague, nothing generic." },
];

const FAQS = [
  {
    q: "I have done coaching before and it did not work. Why would this be different?",
    a: "Most coaching fails because it is unstructured. Open-ended sessions produce feelings, not outcomes. The Clarity Sprint uses the A.L.I.V.E. Method, a four-phase strategic framework with written outputs at every stage. You will leave each call with something on paper. By week four you will have a full vision and action document you can actually use."
  },
  {
    q: "I am not sure I am ready. Is this the right time?",
    a: "If you are waiting to feel ready, you will wait a long time. The Clarity Sprint is specifically designed for women in transition, which means women who do not yet have full clarity. You do not need to arrive knowing what you want. That is exactly what we build together."
  },
  {
    q: "What if I cannot commit to four weeks right now?",
    a: "Then this is not the right moment, and that is completely okay. The Clarity Sprint requires four weekly calls and engagement with the workbook between sessions. If your capacity does not allow that right now, hold this for when it does. Limited spots mean I would rather you book when you can show up fully."
  },
  {
    q: "Is this therapy?",
    a: "No. This is strategic coaching. We are not processing the past; we are building the future. I work from a strategic advisory framework, not a therapeutic one. If you are in a place where you need therapeutic support, I will say so, and I can refer you to people I trust."
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes. Two-instalment payment is available. Message me directly after booking your discovery call and we will arrange it before we begin."
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-awburg-core/10 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-start justify-between w-full text-left gap-4"
      >
        <span className="font-display text-awburg-core text-lg leading-snug">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-awrose-core flex-shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-awrose-core flex-shrink-0 mt-1" />}
      </button>
      {open && (
        <p className="font-body text-awburg-core/75 text-base leading-relaxed mt-4">{a}</p>
      )}
    </div>
  );
}

export default function ClaritySprintPage() {
  return (
    <div className="min-h-screen bg-off-white">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-off-white/95 backdrop-blur-sm border-b border-awburg-core/8 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display italic text-awburg-core text-xl">Laura Jane Thomas</Link>
          <a
            href="/claritysprint-intake"
            className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-paper bg-awburg-core hover:bg-awburg-mid px-5 py-2.5 rounded-full transition-colors"
          >
            Book Now
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">
          A limited engagement for women starting out, building, or repositioning what's next.
        </p>
        <h1 className="font-display text-awburg-core text-5xl md:text-7xl leading-none mb-8">
          You don't need another motivational quote.<br />
          <span className="italic text-awrose-deep">You need a plan.</span>
        </h1>
        <p className="font-body text-awburg-core/80 text-xl md:text-2xl leading-relaxed mb-10 max-w-2xl">
          4 weeks. 4 strategic coaching calls. 1 clear direction forward, so you can stop spinning and start moving.
        </p>
        <a
          href="/claritysprint-intake"
          className="inline-block font-body font-bold text-[11px] tracking-eyebrow uppercase text-paper bg-awburg-core hover:bg-awburg-mid px-10 py-5 rounded-full transition-colors"
        >
          Book Your Clarity Sprint &mdash; R12,500
        </a>
        <p className="font-body text-awburg-core/50 text-sm mt-4">
          Limited to 3 women per month. Online only. Starts within 7 days of booking.
        </p>
        <p className="font-display italic text-awrose-deep text-lg mt-8 max-w-xl leading-relaxed border-l-2 border-awrose-light pl-6">
          Usually I work at senior advisory rates. The Clarity Sprint is calibrated for women earlier in their journey, because that is where I actually love spending my time.
        </p>
      </section>

      {/* THE PROBLEM */}
      <section className="bg-awburg-core text-paper py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-light uppercase mb-6">The Problem</p>
          <h2 className="font-display text-4xl md:text-5xl mb-10 leading-tight">
            Let's be honest about where you are right now.
          </h2>
          <div className="space-y-5 font-body text-paper/80 text-lg leading-relaxed">
            <p>You are capable. You have always been capable. But right now something is not moving, and you cannot quite name what it is.</p>
            <p>Maybe you have been here before. A season of being busy but not productive. Full schedule, hollow feeling. You look productive from the outside. Inside, there is a low-grade heaviness that does not go away no matter how many mornings you start fresh.</p>
            <p>You are running on empty in a way that rest alone does not fix. Because this is not tiredness. This is misalignment. And the difference matters enormously.</p>
          </div>
          <blockquote className="border-l-4 border-awrose-core pl-8 my-12">
            <p className="font-display italic text-3xl md:text-4xl text-paper leading-snug">
              "What am I actually doing with my life?"
            </p>
          </blockquote>
          <div className="bg-awrose-core/20 border border-awrose-core/30 rounded-2xl p-8">
            <p className="font-body text-paper text-xl font-medium leading-relaxed">
              Being stuck isn't a mindset problem. It is so much deeper than that.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT LAURA */}
      <section className="py-24 px-6 bg-awrose-wash">
        <div className="max-w-3xl mx-auto">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">About Laura</p>
          <h2 className="font-display text-awburg-core text-4xl md:text-5xl mb-10 leading-tight">
            I know what stuck feels like.<br /><span className="italic text-awrose-deep">I lived it.</span>
          </h2>
          <div className="space-y-5 font-body text-awburg-core/80 text-lg leading-relaxed">
            <p>I built my first business in my twenties. A brand and communications agency that grew faster than I expected and demanded more than I had. I was good at it. I was also exhausted by it in ways I did not have language for at the time.</p>
            <p>At 36, I burned out. Not dramatically. Quietly. The kind of burnout that looks like competence from the outside and feels like erosion from the inside. I was still performing. I had stopped living.</p>
            <p>Rebuilding took longer than I wanted. It required unlearning the identity I had built around achievement and building something more honest in its place. That process became the foundation for the A.L.I.V.E. Method.</p>
            <p>I did not design it from a theory. I designed it from the experience of living through misalignment, and from a decade of sitting with women who were doing the same.</p>
          </div>
          <div className="mt-12 p-8 bg-paper rounded-2xl border border-awburg-core/8">
            <p className="font-body font-bold text-awburg-core text-base">I am Laura Jane Thomas.</p>
            <p className="font-body text-awburg-core/70 text-base mt-1">Senior strategist. Former agency owner. Brand advisor. Speaker. Creator of the A.L.I.V.E. Method and founder of The Aligned Woman Blueprint.</p>
          </div>
        </div>
      </section>

      {/* THE OFFER */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">The Offer</p>
          <h2 className="font-display text-awburg-core text-4xl md:text-5xl mb-4 leading-tight">
            Introducing The Clarity Sprint.
          </h2>
          <p className="font-body text-awburg-core/70 text-xl mb-14 max-w-2xl">
            Four weeks. Four calls. One clear direction. Structured around the A.L.I.V.E. Method so that every session builds on the last and leaves you with something written in your hands.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                week: "Week 1",
                letter: "A",
                phase: "Awareness",
                what: "We map exactly where you are. Your patterns, your costs, your misalignments. Most clients say this session alone is worth more than they expected.",
                leave: "A written Clarity Diagnostic that names your current state with precision."
              },
              {
                week: "Week 2",
                letter: "L",
                phase: "Liberation",
                what: "We identify what is keeping you stuck. The stories, the structures, the inherited beliefs about what success should look like for someone like you.",
                leave: "A Liberation Map: the specific blocks named, with reframes written for each."
              },
              {
                week: "Week 3",
                letter: "I",
                phase: "Intentional Action",
                what: "We build a 30-day strategic action plan calibrated to your real capacity, not your ideal capacity. No overwhelm. No vague goals.",
                leave: "A written 30-day plan with milestones, priorities, and checkpoints."
              },
              {
                week: "Week 4",
                letter: "V + E",
                phase: "Vision and Embodiment",
                what: "We close the sprint with a full Vision Document: who you are becoming, what you are building, and what it requires from you. Then we make it real.",
                leave: "Your Vision and Identity Document to carry forward."
              }
            ].map((wk) => (
              <div key={wk.week} className="bg-paper border border-awburg-core/8 rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-5">
                  <span className="font-display italic text-awrose-deep text-5xl leading-none">{wk.letter}</span>
                  <div>
                    <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">{wk.week}</p>
                    <p className="font-display text-awburg-core text-xl">{wk.phase}</p>
                  </div>
                </div>
                <p className="font-body text-awburg-core/75 text-sm leading-relaxed mb-4">{wk.what}</p>
                <div className="border-t border-awburg-core/8 pt-4">
                  <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-1">You Leave With</p>
                  <p className="font-body text-awburg-core text-sm">{wk.leave}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE STACK */}
      <section className="py-24 px-6 bg-awrose-pale">
        <div className="max-w-3xl mx-auto">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">What You Get</p>
          <h2 className="font-display text-awburg-core text-4xl md:text-5xl mb-12 leading-tight">
            Everything included in your sprint.
          </h2>
          <div className="space-y-4 mb-10">
            {[
              { item: "4 Strategic Coaching Calls (60 min each)", value: "R20,000" },
              { item: "The Clarity Sprint Workbook", value: "R3,500" },
              { item: "Full Diagnostic and Strategic Plan", value: "R7,500" },
              { item: "Voxer Voice Note Access between calls", value: "R5,000" },
              { item: "Written Vision and Identity Document", value: "R4,000" },
            ].map((row) => (
              <div key={row.item} className="flex items-center justify-between py-4 border-b border-awburg-core/10">
                <span className="font-body text-awburg-core text-base">{row.item}</span>
                <span className="font-body font-bold text-awrose-deep text-base">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-paper rounded-2xl p-8 border border-awburg-core/8 mb-8">
            <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-4">Bonuses Included</p>
            <div className="space-y-3">
              {[
                { item: "Tailored Resource Pack curated to your situation", value: "R3,500" },
                { item: "30-Day Recalibration Call (one month post-sprint)", value: "R3,500" },
                { item: "Full access to The Aligned Woman Blueprint platform", value: "R116,000" },
              ].map((row) => (
                <div key={row.item} className="flex items-center justify-between py-2">
                  <span className="font-body text-awburg-core/80 text-sm">{row.item}</span>
                  <span className="font-body font-bold text-awrose-core text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between py-5 border-t-2 border-awburg-core/20">
            <span className="font-body text-awburg-core/60 text-sm line-through">Total value R163,000</span>
            <div className="text-right">
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase">Your investment</p>
              <p className="font-display text-awburg-core text-4xl">R12,500</p>
            </div>
          </div>
          <a
            href="/claritysprint-intake"
            className="mt-8 w-full flex items-center justify-center font-body font-bold text-[11px] tracking-eyebrow uppercase text-paper bg-awburg-core hover:bg-awburg-mid px-10 py-5 rounded-full transition-colors"
          >
            Book Your Clarity Sprint &rarr;
          </a>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-awburg-core text-4xl md:text-5xl mb-12 leading-tight">
            Is this for you?
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">This is for you if</p>
              <ul className="space-y-3">
                {[
                  "You are capable and experienced but feel directionless right now",
                  "You are at a crossroads: starting something, repositioning, or rebuilding after a transition",
                  "You have tried therapy, journalling, and motivation content, and still feel stuck",
                  "You want structured strategic support, not open-ended talking",
                  "You can commit to four weekly calls and show up to do the work",
                  "You are done performing and ready to build something that actually fits you",
                  "You are willing to be honest about what is not working, even if it is uncomfortable",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-awrose-core flex-shrink-0 mt-2.5" />
                    <span className="font-body text-awburg-core/80 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-body font-bold text-[10px] tracking-eyebrow text-awburg-core/50 uppercase mb-6">This is not for you if</p>
              <ul className="space-y-3">
                {[
                  "You are looking for accountability coaching or ongoing mentorship",
                  "You want someone to validate choices you have already made",
                  "You are not willing to do written work between sessions",
                  "You are in an acute mental health crisis and need therapeutic care",
                  "You are expecting results without genuine engagement",
                  "You want a gentle, comfortable process with no challenge",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-awburg-core/30 flex-shrink-0 mt-2.5" />
                    <span className="font-body text-awburg-core/50 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-awburg-core">
        <div className="max-w-5xl mx-auto">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-light uppercase mb-6">What Women Say</p>
          <h2 className="font-display text-paper text-4xl md:text-5xl mb-14 leading-tight">
            Results from real sprints.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-paper/10 border border-paper/10 rounded-2xl p-8">
                <p className="font-body text-paper/85 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-body font-bold text-paper text-sm">{t.name}</p>
                  <p className="font-body text-awrose-light text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">Common Questions</p>
          <h2 className="font-display text-awburg-core text-4xl md:text-5xl mb-12 leading-tight">
            Your questions, answered.
          </h2>
          <div>
            {FAQS.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-awrose-wash">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body font-bold text-[10px] tracking-eyebrow text-awrose-core uppercase mb-6">Ready to Begin</p>
          <h2 className="font-display text-awburg-core text-4xl md:text-5xl mb-6 leading-tight">
            Two ways to get started.
          </h2>
          <p className="font-body text-awburg-core/70 text-lg mb-12">
            You can book directly if you know this is right for you, or join a 20-minute discovery call first. Either way, the first step is the same.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <a
              href="/claritysprint-intake"
              className="inline-block font-body font-bold text-[11px] tracking-eyebrow uppercase text-paper bg-awburg-core hover:bg-awburg-mid px-10 py-5 rounded-full transition-colors"
            >
              Book Your Clarity Sprint &rarr;
            </a>
            <a
              href="mailto:laura@alignedwomanco.com?subject=Clarity Sprint Discovery Call"
              className="inline-block font-body font-bold text-[11px] tracking-eyebrow uppercase text-awburg-core border border-awburg-core/30 hover:border-awburg-core hover:bg-awrose-pale px-10 py-5 rounded-full transition-colors"
            >
              Book a Discovery Call
            </a>
          </div>
          <div className="space-y-2">
            {[
              "R12,500 total. Two-instalment payment available.",
              "Online via Zoom. Calendar invite sent within 24 hours of booking.",
              "Starts within 7 days. Limited to 3 women per month.",
              "Questions? Email laura@alignedwomanco.com",
            ].map((line) => (
              <p key={line} className="font-body text-awburg-core/55 text-sm">{line}</p>
            ))}
          </div>
        </div>
      </section>

      {/* PS */}
      <section className="py-16 px-6 bg-awburg-core">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display italic text-paper text-2xl md:text-3xl leading-relaxed">
            P.S. If you are reading this and something in you recognises what I am describing, that recognition is data. You do not have to be certain. You just have to be willing to start. That is enough.
          </p>
          <p className="font-body font-bold text-awrose-light text-sm mt-6 tracking-eyebrow uppercase">Laura Jane Thomas</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-awburg-dark text-paper/50 py-10 px-6 text-center">
        <p className="font-body text-xs">
          &copy; {new Date().getFullYear()} Laura Jane Thomas. The Aligned Woman Blueprint.
          {" "}
          <Link to="/" className="hover:text-paper transition-colors">Home</Link>
        </p>
      </footer>
    </div>
  );
}