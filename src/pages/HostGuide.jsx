import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// ────────────────────────────────────────────────────────────────
// Host guide · the document every community host reads before she
// opens her room. Content is the approved community host guide.
//
// Reachable only by a signed in person whose email is linked to a
// partner listing, or an admin. Not linked from any public menu. The
// approval email points hosts here via their Partner Dashboard.
// ────────────────────────────────────────────────────────────────

const H2 = "font-display text-[22px] md:text-[26px] leading-tight text-awburg-core mt-10 mb-3";
const P = "font-body font-light text-[14.5px] leading-[1.7] text-awburg-dark mb-3";
const LI = "font-body font-light text-[14.5px] leading-[1.7] text-awburg-dark";
const UL = "list-disc pl-5 space-y-2 mb-3";
const OL = "list-decimal pl-5 space-y-2 mb-3";

export default function HostGuide() {
  const { user, isLoadingAuth } = useAuth();
  const email = user?.email?.toLowerCase() || "";
  const isAdmin = user?.role === "admin";

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["expert-profile", email],
    queryFn: () => base44.entities.Expert.filter({ linked_user_email: email }),
    enabled: !!email && !isAdmin,
  });
  const allowed = isAdmin || experts.length > 0;

  if (isLoadingAuth || (!isAdmin && isLoading)) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-7 h-7 border-[3px] border-awrose-pale border-t-awburg-core rounded-full animate-spin" aria-label="Loading" /></div>;
  }

  if (!allowed) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <h1 className="font-display text-[26px] text-awburg-core mb-3">This guide is for community hosts.</h1>
        <p className={P}>It opens for partners whose application has been approved. If that is you and you are seeing this, log in with the email address you applied with.</p>
        <Link to="/Apply?intent=community" className="inline-flex items-center justify-center rounded-full bg-awburg-core text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[48px] px-7 mt-4">Apply to host a community</Link>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto px-5 md:px-6 py-10 md:py-14">
      <p className="font-body font-bold text-[10px] tracking-eyebrow uppercase text-awrose-deep mb-3">For businesses and practitioners</p>
      <h1 className="font-display text-[30px] md:text-[38px] leading-tight text-awburg-core mb-2">Host a community on The Aligned <em className="italic">Woman</em> Co.</h1>
      <p className="font-body font-light text-[13px] text-awburg-mid mb-8">Written to be read on a phone. Keep it; you will come back to it.</p>

      <h2 className={H2}>What a community room is</h2>
      <p className={P}>A community room is a private space on The Aligned Woman Co. platform that you host and moderate, for the women you serve. It is not a Facebook group and not a WhatsApp group. It sits inside a platform where every member has signed up with a real name and been approved, and where nothing posted is public, searchable or shareable outside the room.</p>
      <p className={P}>Your room carries your name, your logo and your voice. The Aligned Woman Co. provides the platform, the privacy and the trust standard behind it.</p>

      <h2 className={H2}>What you get</h2>
      <ul className={UL}>
        <li className={LI}>A private room with your business name and logo</li>
        <li className={LI}>A link of your own to share on Instagram, in newsletters or by message, which is the single call to action for your marketing. Your room name is your link: app.alignedwomanco.com/yourroomname. There is no second address to explain</li>
        <li className={LI}>Approval control, so you decide who comes in</li>
        <li className={LI}>Anonymous questions, so women ask what they would never ask in public, while you always see who asked</li>
        <li className={LI}>Threads rather than an endless chat, so a question does not scroll away</li>
        <li className={LI}>Your listing in the AW Verified directory, linked to your room</li>
        <li className={LI}>Pinned posts, so your welcome, your rules and your events stay at the top</li>
      </ul>

      <h2 className={H2}>What we ask of you</h2>
      <ul className={UL}>
        <li className={LI}><strong className="font-semibold">Answer.</strong> A room where questions sit unanswered dies quietly. A few times a week is enough.</li>
        <li className={LI}><strong className="font-semibold">Approve promptly.</strong> Requests to join are the front door of your marketing. Leaving them for a week costs you members.</li>
        <li className={LI}><strong className="font-semibold">Moderate kindly and firmly.</strong> You can remove a post, a reply or a member.</li>
        <li className={LI}><strong className="font-semibold">No medical advice.</strong> Shared experience, education and pointing women to the right help. Never diagnosis or treatment.</li>
        <li className={LI}><strong className="font-semibold">No selling in the room.</strong> You may mention your own work when it genuinely answers a question. No affiliate links, no sales posts, no member's inbox used for marketing.</li>
        <li className={LI}><strong className="font-semibold">Escalate.</strong> If a woman discloses that she is in danger or in crisis, tell us. We agree the route with you before your room opens.</li>
      </ul>

      <h2 className={H2}>What you can see, and what you cannot</h2>
      <p className={P}>You can see the real name and email behind every anonymous post in your room, so you can keep it safe. Members are told this plainly before they join.</p>
      <p className={P}>You cannot see anything else on the platform. Not member lists outside your room, not other rooms, not course data, not payments, not admin settings.</p>

      <h2 className={H2}>What happens after you are approved</h2>
      <ol className={OL}>
        <li className={LI}>You receive an approval email with a link to your Partner Dashboard and this guide.</li>
        <li className={LI}>Your directory listing goes live with the AW Verified badge.</li>
        <li className={LI}>Your room is created in draft. Nobody can see it yet.</li>
        <li className={LI}>You set it up yourself, from the My Community tab. It takes about ten minutes.</li>
        <li className={LI}>You press Publish when you are ready. Your link works from that moment.</li>
      </ol>

      <h2 className={H2}>Setting up your room, step by step</h2>
      <p className={P}>Everything is pre-filled from your application. You are editing, not starting from a blank page. Each step saves as you type.</p>
      <ol className={OL}>
        <li className={LI}><strong className="font-semibold">Your room.</strong> The name, one line underneath it, and the intro women read first. Your logo comes from your listing. Your room's address was set when you were approved, so one link travels everywhere; email us if it ever needs to change.</li>
        <li className={LI}><strong className="font-semibold">About you.</strong> The short bio that appears on the host card in the room. Your directory listing fills this in. Edit it here only if you want the room to read differently.</li>
        <li className={LI}><strong className="font-semibold">The rules.</strong> A ready written set of rules you can keep or change. Three things cannot be switched off: women only, approved members only, nothing shared outside the room. Those are our promise to every member.</li>
        <li className={LI}><strong className="font-semibold">Topics.</strong> The list women choose from when they ask a question. Rename, reorder, retire, add your own. "Something else" always stays last, and it tells you which topic you are missing.</li>
        <li className={LI}><strong className="font-semibold">Your welcome post.</strong> Written in your voice. This becomes the pinned post, so the room is never empty when the first woman arrives.</li>
        <li className={LI}><strong className="font-semibold">Your invite link.</strong> Copy it. It is your room's own address, so one link covers everything: a woman who is new signs up and lands straight back at your join gate, a woman who is already a member walks in.</li>
      </ol>
      <p className={P}>Then press <strong className="font-semibold">Publish</strong>.</p>

      <h2 className={H2}>Running the room day to day</h2>
      <p className={P}><strong className="font-semibold">Join requests.</strong> You are notified in the app and by email. Open Moderate, check the name, Approve or Decline. Either of us can approve, whoever gets there first.</p>
      <p className={P}><strong className="font-semibold">Questions.</strong> Members ask under a topic, anonymously or not. Reply in the thread. Your reply marks the question answered and sits pinned under it, so the next woman with the same question finds it.</p>
      <p className={P}><strong className="font-semibold">Reports.</strong> A member can report any post or reply. Reported posts appear in Moderate. You can remove the post, remove the member, or leave it.</p>
      <p className={P}><strong className="font-semibold">Insights.</strong> You can see how many questions came in, which topics they fell under, and how many were answered. Question text can be downloaded for your own analysis. Names and emails are never included in that export.</p>

      <h2 className={H2}>The promise members are given</h2>
      <p className={P}>Every member sees this before she joins, and it is what the room is built to keep:</p>
      <blockquote className="border-l-[3px] border-awsage-core bg-awrose-wash rounded-r-2xl px-5 py-4 font-display text-[18px] text-awburg-dark mb-3">Real women. Verified sign up. Ask anonymously. Nothing leaves the room.</blockquote>
      <p className={P}>Anything that would break that promise is not a feature we will build, however useful it sounds.</p>

      <h2 className={H2}>Questions</h2>
      <p className={P}><a href="mailto:hello@alignedwomanco.com" className="underline underline-offset-4 text-awburg-bright">hello@alignedwomanco.com</a></p>

      <div className="mt-10">
        <Link to="/partner?tab=community" className="inline-flex items-center justify-center rounded-full bg-awburg-core text-paper font-body font-bold text-[11px] tracking-eyebrow uppercase min-h-[48px] px-7">Back to My Community</Link>
      </div>
    </article>
  );
}
