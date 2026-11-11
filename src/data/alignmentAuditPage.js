// The Alignment Audit sales page (/alignment-audit): settings and copy.
// Everything Laura may want to change lives here. The layout is in
// src/pages/AlignmentAuditPage.jsx.
//
// Copy is word for word from the design "Alignment Audit - Desktop"
// (11 November 2026). Change the wording here, never in the page file.

/* ── SETTINGS ── */
// The $280 Stripe payment link. It carries metadata product=alignment_audit,
// which is what handlePaymentWebhook uses to unlock the audit.
export const BUY_URL = "https://buy.stripe.com/00w28t0sS09r5SFaJreME0a";
export const PRICE = "$280";
export const SPRINT_PRICE = "$2,000";
// What the parts come to at standard rates (the crossed-out figure).
export const PARTS_TOTAL = "$1,088.00";
// How long the blueprint takes. Used in every line that promises it.
export const TURNAROUND = "seven working days";
export const TURNAROUND_SHORT = "7 working days";

export const LOGO = "https://media.base44.com/images/public/69f46886a412ee042303f1af/1c0c68566_awblogo.png";
export const PORTRAIT = "https://media.base44.com/images/public/69f46886a412ee042303f1af/f214efd57_LAURATHOMAS.jpg";
// The hero image (the woman in the rose coat holding the blueprint), and
// the image beside "You can't read the label from inside the jar."
export const HERO_IMAGE = "https://base44.app/api/apps/69f46886a412ee042303f1af/files/mp/public/69f46886a412ee042303f1af/aaec1b4f4_audit-hero-book-spread.png";
// The hero image on tablet and phone (vertical crop: the rose coat and the book).
export const HERO_IMAGE_MOBILE = "https://base44.app/api/apps/69f46886a412ee042303f1af/files/mp/public/69f46886a412ee042303f1af/4abd3cc6a_audit-hero-mobile.png";
export const HERO_ALT = "An open Alignment Audit book on a woman's lap, showing a completed read with The Move";
export const PROBLEM_IMAGE = "https://base44.app/api/apps/69f46886a412ee042303f1af/files/mp/public/69f46886a412ee042303f1af/c0ebf9f23_audit-open-door-spread.png";

/* ── CONTENT ── */
export const STEPS = [
  { k: "Today", t: "pay, and your questionnaire is waiting on your dashboard" },
  { k: "Your pace", t: "answer online. It saves as you go, and you can skip anything that feels too heavy to write down" },
  { k: "Within seven working days", t: "your blueprint arrives" },
  { k: "Then", t: "an hour with me to go through it" },
  { k: "After the call", t: "your AI script" },
];

export const ACTS = [
  {
    id: "you", label: "Act one: You", act: "Act one", short: "You",
    chapters: [
      { n: 1, name: "Where you are right now", look: "Your life as it looks from the outside, against how it feels from the inside, and what happens if nothing changes for 12 months.", back: "The gap between the two versions, named plainly. Most women have never seen it written down." },
      { n: 2, name: "Awareness: what you're not seeing", look: "The \"once things calm down\" stretch that turned into your life. The conversation you're avoiding. What your closest people keep telling you that you brush off.", back: "Your blind spots, named. The things everyone around you can see and you can't, because you're standing inside them." },
      { n: 3, name: "Energy: where it goes", look: "Fourteen areas of your life, each marked as draining you or filling you up. One ordinary day, walked through hour by hour. The invisible load you carry that nobody counts.", back: "Your Energy Leak Map: exactly where your energy is going and the one leak costing you most. You'll know why you're tired, not just that you are." },
      { n: 4, name: "Liberation: what you're carrying", look: "The roles you're still in out of guilt. Whose approval you're still working for. The rule about money, work or being a woman that still runs you.", back: "A clear line between what's yours to carry and what you picked up from someone else, plus permission to put the second pile down." },
      { n: 5, name: "Embodiment: how you're living it", look: "Your sleep, your pace, how long it takes you to recover after stress, and the thing that works for you that you've stopped doing.", back: "What your body has been trying to tell you, read alongside everything else. A plan that ignores this part doesn't last." },
    ],
  },
  {
    id: "work", label: "Act two: Your work", act: "Act two", short: "Your work",
    chapters: [
      { n: 6, name: "Confidence: how you show up", look: "Where you say yes at work when you mean no. Where you're waiting to feel ready. Who you gave the credit to for your last win.", back: "The pattern that follows you from home into the boardroom, and how it's costing you at work." },
      { n: 7, name: "Your work", look: "What people always come to you for. What makes you angry, and the line being crossed. The sentence you'd stand behind if your name stood on its own.", back: "What you're actually known for, what you should be known for, and the values your work has to protect." },
    ],
    track: {
      business: "your positioning, the client you'd clone, where your money really comes from, where it's leaking, and whether the business could survive a month without you.",
      career: "how your value is described when you're not in the room, whether you've outgrown your role, what you're worth in your market, and the next move you keep circling.",
      back: "a read on your position, value, visibility and pace, with the moves that would change each one.",
    },
  },
  {
    id: "next", label: "Act three: What's next", act: "Act three", short: "What's next",
    chapters: [
      { n: 8, name: "Intention: what you actually want", heart: true, look: "What you want, written as if nobody will ever read it. Then what you think you should want, and whose voice that is. How you make big decisions, and whether you ask AI or other people before you've asked yourself.", back: "What you want, separated from everyone else's voice. This chapter is the heart of the Audit." },
      { n: 9, name: "Vision: where you're heading", look: "An ordinary Tuesday three years from now. One dream for the next 12 months, including the version you'd be embarrassed to say out loud. What you'll give up for it, what you won't, and what's really in the way.", back: "Two roads: where you're headed if nothing changes, and where you go if you make the call. Each obstacle is marked as a real constraint or a fear dressed up as a fact." },
      { n: 10, name: "The honest bit", look: "What you're most afraid I'll tell you. What you already know you need to do. How ready you really are.", back: "The truth, said kindly and plainly, by someone with nothing to gain from flattering you." },
      { n: 11, name: "The evidence bank", look: "Everything you've done that proves you can make this real. What got you through the last hard stretch.", back: "Your proof, collected in one place, so the next time you doubt yourself you have something to read." },
    ],
  },
];

// "a", then an italic "em", then "b". "key" is the label in the chat mock.
export const AI_KNOWS = [
  { a: "What you actually want, and the \"should\" voice to push back on", key: "What she wants" },
  { a: "Your pattern, by name, so it calls you out when you slip back into it", key: "Her pattern" },
  { a: "Your non-negotiables, the things you said you won't give up", key: "Non-negotiables" },
  { a: "Where your energy leaks, so it plans your week around what fills you up", key: "Energy leaks" },
  { a: "How you make decisions, so it asks what ", em: "you", b: " think before it offers an opinion", key: "How she decides" },
  { a: "Your evidence bank, so it reminds you what you've already done when you doubt yourself", key: "Evidence bank" },
];

export const ITEMS = [
  { name: "Your questionnaire", desc: "Business or career track, online, saves as you go.", value: "Included" },
  { name: "Your blueprint, written by me", desc: "Where you are, what it's costing you, what you want, and your next move.", value: "Valued at $688" },
  { name: "One hour with me", desc: "We go through it together so you leave knowing what to do and why.", value: "Valued at $400" },
  { name: "Your AI script", desc: "Your blueprint, turned into custom instructions for ChatGPT or Claude. Your AI knows what you want, your pattern and your non-negotiables, so it keeps you on track long after our call.", value: "Included" },
];

export const TESTIMONIALS = [
  { h: "For the first time in my business, everything feels aligned.", q: "I came to Laura overwhelmed and unclear about how to position my brand. Within a matter of weeks, she helped me articulate exactly what I do, who I do it for, and how to confidently show up as a leader. For the first time in my business, everything feels aligned, and the results speak for themselves.", who: "Tasha Berrings", co: "Founder, Clean Beauty Startup" },
  { h: "Laura provides actionable support to help you thrive.", q: "Laura provides actionable support to help you thrive. If you're considering her for consulting or coaching, I can hands down say you're getting your money's worth. You leave with valuable insights and practical techniques to help navigate and reconnect with what truly drives you, all while protecting your energy so you don't end up overworked and burnt out. One session and Laura will leave you feeling empowered. I highly recommend her services.", who: "Tharunisa Reddy", co: "" },
  { h: "She taught me to back myself.", q: "Laura is just phenomenal. She helped me connect to my core and feel more confident about what I do and the value I provide to others. I feel far less awkward selling myself or my services. She taught me to back myself, and to detach my sense of self-worth from how much I make. It set me free, and I am excited for the next chapter in my career.", who: "Iris Smyth", co: "" },
  { h: "Working with Laura was like plugging my business into power.", q: "She pulled the strategy, story, and messaging out of me in a way that felt effortless. The outcome was anything but. I now have a clear roadmap, a stronger offer, and marketing that finally makes sense and feels like me.", who: "Vanessa Rathbone", co: "Founder, Wellness Consultancy" },
  { h: "Brand therapist, coach, and visionary all in one.", q: "Laura isn't just a strategist. She's a brand therapist, coach, and visionary all in one. Her ability to combine mindset work with razor-sharp strategy is unmatched. I walked away with more than a brand. I walked away with confidence, direction, and a business that is finally growing.", who: "Elena S.", co: "CEO, Luxury Wellness Brand" },
  { h: "Zoom out and zoom in with equal brilliance.", q: "I have worked with other consultants before, but no one has Laura's ability to zoom out and zoom in with equal brilliance. Her mind is next level.", who: "Ashleigh", co: "Founder, Thee Lux Retreat Co." },
  { h: "Laura has an extraordinary gift for translating messy ideas into clear, compelling vision.", q: "She doesn't just 'get' what's in your head, she elevates it beyond what you thought was possible. Her blend of strategic insight, creative brilliance, and intuition is unmatched. I can't recommend her highly enough.", who: "Wendy Mahoney", co: "Newmella Holdings" },
  { h: "Partnering with this team has been transformative for Ubank.", q: "We have never experienced such rapid and consistent elevation of our brand. Their strategic alignment of both our internal and external communications, coupled with their ability to manage high-level partnerships, has significantly advanced our business objectives, even earning us industry recognition. Their professionalism, dedication, and impact have been exceptional. We highly recommend their services.", who: "Luthando Vutula", co: "CEO, Ubank" },
  { h: "This was a complete inside-out transformation of a business established for over 30 years.", q: "Taking on this project was no small feat. The strategy and rebrand not only needed to resonate with our customers, but also with both internal and external stakeholders. Laura's presentation of the new brand direction received immediate buy-in from our external partners and was successfully rolled out internally to ensure alignment at every level. This rebrand combines visual appeal with real-world functionality, driving both engagement and execution.", who: "Kevin Vyvyan-Day", co: "CEO, Barron" },
  { h: "I thought I was just getting a logo, but what Laura delivered was an entire brand world.", q: "She didn't just design something beautiful; she built a visual system that finally reflects the depth and direction of my business. It's cohesive, elevated, and powerful. I finally feel seen and so does my audience.", who: "Jenna Cummings", co: "Founder, Luxury Interior Studio" },
  { h: "Laura and her team take no prisoners and always aim for excellence.", q: "We might live on the opposite sides of the world, but that hasn't stopped us from success. I hired Laura to help with Strategy for two clients. Both of these clients' social media accounts engagement rate and website visits went up as a result. I look forward to continuing to work with Laura!", who: "Stephanie O'Brien", co: "Founder, Carmella Consulting" },
  { h: "Laura and her team successfully captured the essence of our luxury mental wellness brand.", q: "A brand transcends mere elements such as logos and visuals; it embodies the brand's personality. Healing Destinations holds personal significance to me, and this can present a formidable challenge for many. The result was an exemplary final product. For those seeking insight, creativity and a beautiful brand, I highly recommend.", who: "Mica Angel", co: "Mother, Founder & CEO, Healing Destinations" },
  { h: "No matter whether you are local or international, this is the company to take your marketing to another level.", q: "Laura and her team are able to beat time difference odds and provide us with extremely fast service. We have also been able to upscale our client delivery, because of Laura's insight in culture and marketing strategy. The keen eye for detail and gorgeous design is a huge bonus!", who: "Shanny Sommer", co: "CEO, Welcome To Influence" },
  { h: "They listened attentively, grasped our needs and consistently exceeded our expectations.", q: "From the moment we engaged with them, it was evident that they are deeply knowledgeable and invested in our brand's success. Their commitment to understanding our vision and goals was refreshing.", who: "Charen Nortje", co: "CEO, Ring Artisan" },
  { h: "Working with Laura and her team has been an amazing experience.", q: "I would recommend 100%, very hands on, professional and understanding. I wished I had found her sooner. Continue being such an amazing company!!", who: "Christelle Dossous", co: "Onaturell Beauty" },
  { h: "Real insight, real confidence.", q: "Laura's talk on The Hidden Tax on Female Leadership made me think differently about where I am in my life and my work. It gave me real insight, real confidence, and I wish it had been longer.", who: "Big5Digital", co: "Guest keynote, 2026" },
  { h: "No one has ever explained money to me the way she did.", q: "Laura was incredible. No one has ever explained money to me the way she did. Her stories were so real, you could hear a pin drop in the room. She really touched people.", who: "Mpho Gumede", co: "That Brunch Club" },
  { h: "Our Women's Day celebration was a huge success.", q: "To the most amazing speaker and panellist, on behalf of the D&I team and EY, thank you for helping make our Women's Day celebration a huge success.", who: "Clayton Jordy Fowlds", co: "D&I Team, EY" },
  { h: "They even stayed overtime.", q: "The teams thoroughly enjoyed and were engaged in your H2H workshop. They even stayed overtime. Thank you for such a fantastic session.", who: "Cathy Stadler", co: "Director of Marketing, Oracle" },
];

export const FAQ = [
  { q: "\"I've done the Starting Point Profile. Isn't this the same?\"", a: "No. The Profile names your pattern. The Audit reads your whole situation, starting with you and then your business or career. It shows you how that pattern plays out and what to do next." },
  { q: "\"Who writes my blueprint? Is it AI?\"", a: "I do. I read every answer and write your blueprint myself. The AI script is separate: instructions I write for you to paste into your own ChatGPT or Claude." },
  { q: "\"Is this coaching?\"", a: "It's a diagnosis. You get a written blueprint, one call and your AI script. If you want ongoing work after that, that's the Clarity Sprint, and your fee comes off it." },
  { q: "\"What's the AI script?\"", a: "After our call, I write custom instructions for your ChatGPT or Claude, built from your blueprint: what you want, what you've decided, what you won't compromise on, and the pattern to call you out on. Paste them in once, and every conversation starts from you instead of the average of everyone else. It keeps the work going after our hour is up." },
  { q: "\"I don't run a business.\"", a: "Choose the career track at the start. The questions follow your role, your value and your next move." },
  { q: "\"I'm already flat out. I don't have time for this.\"", a: "It saves as you go, so you can do it in pieces. Then I do the work. The call is the only hour you have to block out." },
  { q: "\"Will you ask about my finances?\"", a: "I'll ask how money moves through your business or career. I won't ask for bank statements, account details or amounts." },
  { q: "\"What happens after I pay?\"", a: "You get an email straight away. Sign in at app.alignedwomanco.com with the email you paid with, and your questionnaire is waiting on your dashboard. Submit it whenever you're ready. Your seven working days start then." },
];

export const FOR_YOU = [
  "You're ambitious, and you know something has to change.",
  "You look capable from the outside and second-guess every big call.",
  "You want an honest read before you spend money on the wrong fix.",
  "You want to start somewhere real before you commit to six weeks of the Sprint.",
];

export const NOT_FOR_YOU = [
  "You want someone to make the decision for you.",
  "You want reassurance more than the truth. I'll tell you what I see, even when it's not what you hoped to hear.",
  "You're not going to act on what you read.",
];

// Footer links. Paths starting with "/" stay inside the app.
export const FOOTER = [
  { title: "Explore", links: [["Home", "/"], ["Our Why", "/OurWhy"], ["The Blueprint", "/blueprint"], ["Caps4Cause", "/caps"], ["Alignment Audit", "/alignment-audit"]] },
  { title: "About", links: [["About Us", "/about-us"], ["Our Founder", "/founder"], ["Contact", "/Contact"], ["Terms & Conditions", "/terms-and-conditions"], ["Giveaway T&Cs", "/competition"]] },
  { title: "Social", links: [["Instagram", "https://www.instagram.com/alignedwoman_co/"], ["YouTube", "https://www.youtube.com/@AlignedWomanCo"], ["Email", "mailto:hello@alignedwoman.com"], ["LinkedIn", "https://www.linkedin.com/company/the-aligned-woman/"]] },
];