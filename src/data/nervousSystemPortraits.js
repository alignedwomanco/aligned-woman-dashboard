/**
 * Portrait templates for the nervous system baseline workbook.
 * Keyed by the values produced by computeWorkbookScores:
 *   dominant_state_variant  → DOMINANT_STATE
 *   window_classification   → WINDOW
 *   resource_classification → RESOURCES
 *   somatic_classification  → SOMATIC
 */

export const DOMINANT_STATE_PORTRAITS = {
  ventral_vagal: {
    title: "Your Dominant State: Safe & Connected",
    body: "Your nervous system spends most of its time in ventral vagal — the social engagement state. This is your regulated baseline. You have access to curiosity, connection, and clear thinking more often than not. This doesn't mean life is easy; it means your system has a strong home base to return to. Your work is about protecting and deepening this capacity, especially during seasons that challenge it.",
  },
  sympathetic: {
    title: "Your Dominant State: Activated & On Edge",
    body: "Your nervous system's default is sympathetic activation — fight-or-flight. This state is designed for short bursts of threat response, not as a way of living. When it becomes your baseline, it often shows up as chronic urgency, difficulty resting, anxiety that doesn't match your circumstances, or a body that never quite settles. This isn't a character flaw. It is a survival adaptation. And it can shift.",
  },
  dorsal_vagal: {
    title: "Your Dominant State: Shut Down & Withdrawn",
    body: "Your nervous system's default is dorsal vagal — the shutdown or collapse state. This is the body's last-resort protection when life has felt too much for too long. It often looks like exhaustion that sleep doesn't fix, emotional flatness, difficulty caring, or a sense of being behind glass. This state is protective, not broken. Understanding it is the first step to gently expanding back toward life.",
  },
  cycling: {
    title: "Your Dominant State: Moving Between States",
    body: "Your nervous system moves fluidly between states — sometimes within the same day. You may know the experience of being completely wired in the morning and collapsed by evening, or flipping from fine to overwhelmed with no clear reason. This cycling pattern often reflects a nervous system that is working very hard to manage an environment it perceives as unpredictable. Rhythm and predictability are your greatest resources.",
  },
  oscillating: {
    title: "Your Dominant State: Oscillating",
    body: "Your pattern shows significant time in both sympathetic activation and dorsal shutdown — a nervous system oscillating between the two extremes with limited time in the regulated middle. This is one of the most exhausting patterns to live in. Your system is working overtime. The path forward is not about pushing through; it is about finding small, consistent moments of safety that interrupt the cycle.",
  },
};

export const WINDOW_PORTRAITS = {
  narrow: {
    title: "Your Window of Tolerance: Currently Narrow",
    body: "Right now, your window of tolerance is narrow. Small stressors can tip you outside of it quickly, and returning to baseline takes considerable time. This is important information, not a life sentence. A narrow window often reflects a season of high demand, accumulated stress, or unprocessed experiences. Gentle, consistent support — not pushing harder — is what widens it over time.",
  },
  moderate_narrow: {
    title: "Your Window of Tolerance: Moderate with Narrowing Tendencies",
    body: "Your window of tolerance is moderate, with a tendency to narrow under pressure. You can manage day-to-day demands but find yourself more reactive or slower to recover during harder stretches. This is a common place to be. You have a foundation to build from, and there is real room to widen your window with the right support and practices.",
  },
  moderate_wide: {
    title: "Your Window of Tolerance: Moderately Wide",
    body: "Your window of tolerance is reasonably wide. You have solid capacity to handle life's demands without tipping into reactivity or shutdown, and you recover from stress within a reasonable timeframe. This is a strong foundation. The invitation now is to deepen and protect it — noticing what narrows your window and being intentional about what restores it.",
  },
  wide: {
    title: "Your Window of Tolerance: Wide and Resilient",
    body: "Your window of tolerance is wide. You demonstrate strong capacity to move through challenge, return to baseline relatively quickly, and tolerate a range of stressors without becoming dysregulated for extended periods. This is genuine resilience — not toughness, but flexibility. Your work is to maintain this capacity and recognise early signals when it begins to narrow.",
  },
};

export const RESOURCE_PORTRAITS = {
  no_tools: {
    title: "Your Regulation Resources: Building from Scratch",
    body: "Right now, you haven't identified any consistent regulation tools in your toolkit. This is honest, and it's useful. It means we begin here. Regulation doesn't require a long practice list. It starts with one thing that reliably helps your nervous system settle — even briefly. You'll build from there.",
  },
  limited_tools: {
    title: "Your Regulation Resources: A Small but Real Toolkit",
    body: "You have one or two things that help your nervous system settle. This is a beginning, not a limitation. Having even one reliable resource is significant. The next step is understanding when and how to use them more intentionally — and slowly expanding the range so you have options for different states and different seasons.",
  },
  moderate_tools: {
    title: "Your Regulation Resources: A Growing Toolkit",
    body: "You have a meaningful range of regulation tools — things that genuinely help your system settle, recover, or restore. This is real capacity. The work now is integration: using these tools proactively rather than reactively, and understanding which tools work for which states. Not all regulation is the same — what helps activation is often different from what helps collapse.",
  },
  strong_tools: {
    title: "Your Regulation Resources: A Rich Toolkit",
    body: "You have a rich range of regulation resources at your disposal. This is a significant advantage. The question is no longer what helps — it is whether you are using these tools consistently and strategically. Strong toolkits can sometimes mask a nervous system that is still running on high, keeping things together through effort rather than genuine ease. Audit how you feel on your 'off days.'",
  },
};

export const SOMATIC_PORTRAITS = {
  low: {
    title: "Your Body Awareness: Developing",
    body: "You are in the early stages of building somatic awareness — noticing where and how your nervous system speaks through your body. This is not a gap; it is a starting place. Many women have learned to live from the neck up, disconnected from body signals that hold crucial information. The practices in this programme will gently rebuild this connection. You don't need to force it.",
  },
  moderate: {
    title: "Your Body Awareness: Emerging",
    body: "You have some awareness of how stress and safety show up in your body — you recognise some of the signals, even if the connection isn't always clear or immediate. This is a meaningful foundation. Building on it means slowing down long enough to listen, and learning to trust what you notice rather than dismissing it.",
  },
  high: {
    title: "Your Body Awareness: Strong",
    body: "You have strong somatic awareness. You recognise where your nervous system speaks through your body — in stress, in shutdown, and in safety. This is a genuine resource. It means you have access to real-time information about your state that many people miss entirely. The invitation is to act on what you notice, not just observe it.",
  },
};

export const STATE_DISPLAY_NAMES = {
  ventral_vagal: "Safe & Connected",
  sympathetic:   "Activated & On Edge",
  dorsal_vagal:  "Shut Down & Withdrawn",
  cycling:       "Moving Between States",
  oscillating:   "Oscillating",
};

export const WINDOW_DISPLAY_NAMES = {
  narrow:          "Narrow",
  moderate_narrow: "Moderate — Narrowing",
  moderate_wide:   "Moderate — Wide",
  wide:            "Wide & Resilient",
};

export const RESOURCE_DISPLAY_NAMES = {
  no_tools:       "Building from Scratch",
  limited_tools:  "Limited",
  moderate_tools: "Moderate",
  strong_tools:   "Strong",
};

export const SOMATIC_DISPLAY_NAMES = {
  low:      "Developing",
  moderate: "Emerging",
  high:     "Strong",
};

export const STRESS_LOCATION_LABELS = {
  jaw: "Jaw", throat: "Throat", shoulders: "Shoulders & neck", chest: "Chest",
  stomach: "Stomach", lower_back: "Lower back", hips: "Hips & pelvis",
  hands: "Hands", skin: "Skin", whole_body: "Whole body",
};

export const SAFETY_SIGNAL_LABELS = {
  easy_breath: "Easy breathing", relaxed_shoulders: "Relaxed shoulders",
  warm: "Warmth in chest or belly", soft_jaw: "Soft jaw",
  steady_heart: "Steady heartbeat", grounded_feet: "Grounded feet",
  open_posture: "Open posture", clear_mind: "Clear mind",
  desire_connect: "Desire to connect",
};

export const SHUTDOWN_LOCATION_LABELS = {
  heavy_limbs: "Heavy limbs", foggy_head: "Foggy head",
  no_appetite: "Appetite changes", fatigue: "Deep fatigue",
  numbness: "Physical numbness", cold: "Feeling cold",
  flat_face: "Flat expression", low_voice: "Quiet voice",
  disconnected: "Disconnected from body",
};