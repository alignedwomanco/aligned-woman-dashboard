import React from "react";
import { Link } from "react-router-dom";

const sections = [
  {
    number: "1",
    title: "The Promoter",
    content: `This giveaway is run by The Aligned Woman Co (Pty) Ltd ("the Promoter") in collaboration with the participating brands: Inuwell, BLUUM, IVGo, N3YH, Sloom and evryday ("the Partners"). Contact: hello@alignedwomanco.com.`
  },
  {
    number: "2",
    title: "Eligibility",
    items: [
      "Open to women aged 18 years or older.",
      "Entrants must be resident in South Africa.",
      "Employees of the Promoter and the Partners, and their immediate families, may not enter.",
      "By entering, you confirm you meet these requirements and accept these terms."
    ]
  },
  {
    number: "3",
    title: "Entry period",
    items: [
      "The giveaway opens on 10 June 2026 and closes at 23:59 SAST on 14 June 2026.",
      "Entries received after the closing time will not be counted."
    ]
  },
  {
    number: "4",
    title: "How to enter",
    intro: "To enter, you must:",
    items: [
      "Follow @alignedwomanco and all participating brand accounts listed in the post;",
      "Like the giveaway post;",
      "Tag at least one woman in the comments;",
      "Save the post."
    ],
    outro: "Sharing the post to your Instagram stories and tagging additional friends earns extra entries. Each valid friend tagged in a separate comment counts as one additional entry."
  },
  {
    number: "5",
    title: "The prize",
    items: [
      <>One winner receives the full prize bundle, valued at over R20,000, consisting of: <ul className="list-none mt-2 space-y-1 pl-4">
        <li>(a) The Aligned Woman Blueprint programme from The Aligned Woman Co;</li>
        <li>(b) A one-hour Wellcare experience from Inuwell (Wellcare consultation, a Svenson Chair session and an Emsculpt session);</li>
        <li>(c) A hormone support set from BLUUM (menopause, PMS and bloat support);</li>
        <li>(d) A NAD+ pen from IVGo, including the required doctor consultation;</li>
        <li>(e) An Eco-Luxe sleepwear set from N3YH;</li>
        <li>(f) An adjustable memory foam pillow from Sloom;</li>
        <li>(g) A lingerie set from evryday.</li>
      </ul></>,
      "There is one winner. The prize is awarded as a single bundle and cannot be split.",
      "The prize is not transferable and cannot be exchanged for cash or any other item.",
      "Prizes are subject to availability. If any item becomes unavailable, the Promoter or relevant Partner may substitute it with an item of equal or greater value."
    ]
  },
  {
    number: "6",
    title: "Prize redemption",
    items: [
      "The Blueprint programme is delivered digitally.",
      "Physical products are delivered within South Africa at no cost to the winner.",
      "In-person experiences (the Inuwell Wellcare experience) are redeemed in Cape Town. The winner is responsible for their own travel to and from these appointments.",
      "Each Partner's standard booking, validity and usage conditions apply to their portion of the prize. Experiences must be booked and redeemed within 3 months of the winner announcement."
    ]
  },
  {
    number: "7",
    title: "Winner selection and notification",
    items: [
      "The winner is drawn at random from all valid entries after the closing time.",
      "The winner is announced on 15 June 2026 and notified by direct message from @alignedwomanco.",
      "The winner must respond within 7 days of being notified. If the winner cannot be reached or does not respond within this period, the Promoter may draw an alternative winner.",
      "The Promoter's decision is final and no correspondence will be entered into."
    ]
  },
  {
    number: "8",
    title: "General",
    items: [
      "The Promoter may disqualify any entry that is fraudulent, uses fake or duplicate accounts, or does not comply with these terms.",
      "The Promoter may amend, suspend or cancel the giveaway at any time for reasons beyond its reasonable control.",
      "The Promoter and Partners are not liable for any loss or damage arising from participation or from the use of any prize, except where liability cannot be excluded by law."
    ]
  },
  {
    number: "9",
    title: "Instagram",
    content: "This giveaway is in no way sponsored, endorsed, administered by or associated with Instagram or Meta. By entering, you release Instagram and Meta from any responsibility."
  },
  {
    number: "10",
    title: "Personal information",
    content: "Entrants' personal information is used only to run this giveaway and contact the winner, in line with the Protection of Personal Information Act (POPIA). It will not be shared or used for any other purpose without consent."
  }
];

export default function Competition() {
  return (
    <div className="min-h-screen bg-[#FAF5F3]">
      {/* Header */}
      <div className="bg-[#4A0E2E] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#C4847A] font-body font-bold text-[10px] tracking-[0.22em] uppercase mb-4">
            The Aligned Woman Co
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white leading-tight mb-4">
            Giveaway
          </h1>
          <p className="font-body text-white/70 text-sm tracking-[0.12em] uppercase">
            Terms &amp; Conditions
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.number} className="border-b border-[rgba(74,14,46,0.08)] pb-10 last:border-0">
              <h2 className="font-body font-bold text-[11px] tracking-[0.22em] uppercase text-[#C4847A] mb-1">
                {section.number}.
              </h2>
              <h3 className="font-display text-2xl text-[#4A0E2E] mb-4">
                {section.title}
              </h3>

              {section.content && (
                <p className="font-body text-[#3A2A28] text-base leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.intro && (
                <p className="font-body text-[#3A2A28] text-base leading-relaxed mb-3">
                  {section.intro}
                </p>
              )}

              {section.items && (
                <ol className="space-y-3" start={1}>
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-3 font-body text-[#3A2A28] text-base leading-relaxed">
                      <span className="text-[#C4847A] font-bold flex-shrink-0 text-sm mt-0.5">
                        {section.number}.{i + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              )}

              {section.outro && (
                <p className="font-body text-[#3A2A28] text-base leading-relaxed mt-3">
                  {section.outro}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-[#4A0E2E]/5 rounded-xl border border-[rgba(74,14,46,0.1)] text-center">
          <p className="font-body font-bold text-[#4A0E2E] text-base">
            By entering, you agree to these terms and conditions.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="font-body font-bold text-[10px] tracking-[0.22em] uppercase text-[#C4847A] hover:text-[#4A0E2E] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}