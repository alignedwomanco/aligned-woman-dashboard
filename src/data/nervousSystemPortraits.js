/**
 * Portrait templates for the nervous system baseline workbook.
 * Keyed by the values produced by computeWorkbookScores:
 *   dominant_state_variant  (portrait_keys.dominant) → DOMINANT_STATE
 *   window_classification                             → WINDOW
 *   resource_classification                           → RESOURCES
 *   somatic_classification                            → SOMATIC
 */

export const DOMINANT_STATE_PORTRAITS = {
  ventral_vagal: {
    title: "Regulated and Connected",
    body: "Your system spends most of its time in a regulated, connected state. This is a strong foundation. The work ahead is less about crisis management and more about deepening your capacity and understanding what keeps you here, so you can return more quickly when life pulls you out.",
  },
  sympathetic: {
    title: "Living in Activation",
    body: "Your system is spending most of its time in an activated state. This does not mean something is wrong with you. It means your nervous system has learned that staying alert feels safer than relaxing. You may have been running on adrenaline and willpower for so long that it feels normal. The regulation practices ahead are designed to show your system that it is safe to come down.",
  },
  dorsal_vagal: {
    title: "In Withdrawal",
    body: "Your system is spending most of its time in a withdrawn, low-energy state. This is not laziness. It is your nervous system's way of protecting you when activation felt too overwhelming for too long. You may feel disconnected from your body, your motivation, or your sense of self. The work ahead focuses on gentle reactivation: not pushing through, but slowly showing your system it is safe to come back online.",
  },
  cycling: {
    title: "Moving Between States",
    body: "Your system is moving between states unpredictably. You may feel wired in the morning and collapsed by afternoon, or fine one day and overwhelmed the next. This cycling pattern often shows up when the nervous system has not had enough safety to settle into any one state for long. The regulation practices ahead will focus on building a wider, more stable baseline rather than managing individual swings.",
  },
  oscillating: {
    title: "The Activation-Shutdown Loop",
    body: "Your system appears to be oscillating between activation and shutdown. You may recognise the pattern: periods of high output and anxiety followed by crashes into numbness or exhaustion. This is one of the most common patterns in women navigating burnout. The regulation module addresses both ends of this swing.",
  },
  ventral_tied_with_sympathetic: {
    title: "Regulated But Pulled Toward Activation",
    body: "Your system has access to a regulated state, but activation is competing for dominance. This is actually promising. It means you already know what safety feels like in your body. The work ahead is about tipping the balance so that regulated state becomes your primary home rather than a place you visit between stretches of being wired.",
  },
  ventral_tied_with_dorsal_vagal: {
    title: "Regulated But Pulled Toward Withdrawal",
    body: "Your system has access to a regulated state, but shutdown is competing for dominance. This is actually promising. It means you already know what safety feels like in your body. The work ahead is about tipping the balance so that regulated state becomes your primary home rather than a place you visit between stretches of feeling flat or disconnected.",
  },
  ventral_tied_with_cycling: {
    title: "Regulated But Unstable",
    body: "Your system has access to a regulated state, but unpredictable swings are competing for dominance. This is actually promising. It means you already know what safety feels like in your body. The work ahead is about stabilising your baseline so that regulated state becomes your consistent home rather than one of several states you cycle through.",
  },
};

export const WINDOW_PORTRAITS = {
  narrow: {
    title: "Your window is narrow right now",
    body: "Right now, your window of tolerance is narrow. Small stressors can push you into overwhelm or shutdown, and it takes time to come back. This is not a permanent state. It is a reflection of how much your system has been carrying. As you build regulation capacity through this module, the window will widen.",
  },
  moderate_narrow: {
    title: "Your window is on the narrower side",
    body: "Your window of tolerance has some room in it, but it narrows under pressure. You can handle day-to-day demands, but when stress stacks up, you may find yourself tipping over more quickly than you would like. The practices ahead will help you build a buffer.",
  },
  moderate_wide: {
    title: "Your window has room in it",
    body: "Your window of tolerance is reasonably wide. You can handle a fair amount before dysregulating, and you have some capacity to recover. The work ahead will help you understand what maintains this window and how to protect it during high-demand seasons.",
  },
  wide: {
    title: "Your window is relatively wide",
    body: "Your window of tolerance is relatively wide right now. You can hold a lot before losing your centre, and you recover fairly quickly when you do. This is a strong position to be in. The regulation module will deepen your understanding of how your system works and give you tools to maintain this capacity long-term.",
  },
};

export const RESOURCE_PORTRAITS = {
  no_tools: {
    title: "Starting from scratch",
    body: "You indicated that you do not currently have reliable tools for coming back to yourself when you are dysregulated. That is an honest and important starting point. Building your first set of regulation practices is a primary outcome of this module. You are not behind. You are exactly where you need to be to begin.",
  },
  limited_tools: {
    title: "A few tools to build on",
    body: "You have a small number of regulation resources you can draw on. That is more than many women in this position have. The module ahead will expand your toolkit and help you understand why the tools you already use work, so you can use them more intentionally.",
  },
  moderate_tools: {
    title: "A reasonable toolkit",
    body: "You have a reasonable set of tools for self-regulation. The module will help you understand the nervous system science behind them, which tools work for which states (an activation tool is different from a shutdown tool), and how to sequence them for maximum effect.",
  },
  strong_tools: {
    title: "A solid foundation",
    body: "You already have a solid toolkit of regulation practices. The module will deepen your understanding of why they work at a nervous system level and introduce additional approaches you may not have encountered, particularly for the specific state patterns you identified above.",
  },
};

export const SOMATIC_PORTRAITS = {
  low: {
    title: "Building body awareness",
    body: "Your body awareness may still be developing, and that is completely normal. Many women, especially those who have spent years in their heads or pushing through, have learned to ignore their body's signals. A core part of this module is rebuilding that connection gently and at your own pace.",
  },
  moderate: {
    title: "Growing body literacy",
    body: "You have some awareness of how your body communicates with you. You can identify where stress lives and you are beginning to recognise the physical signatures of different states. This module will sharpen that awareness and help you use your body as an early warning system rather than a source of symptoms to manage.",
  },
  high: {
    title: "Strong body connection",
    body: "You have strong body awareness. You can identify where different states show up physically, and you have language for what safety feels like in your body. This is a real asset. The module will build on this foundation and connect your somatic awareness to practical regulation strategies.",
  },
};

export const STATE_DISPLAY_NAMES = {
  ventral_vagal:                  "Regulated and Connected",
  sympathetic:                    "Living in Activation",
  dorsal_vagal:                   "In Withdrawal",
  cycling:                        "Moving Between States",
  oscillating:                    "The Activation-Shutdown Loop",
  ventral_tied_with_sympathetic:  "Regulated But Pulled Toward Activation",
  ventral_tied_with_dorsal_vagal: "Regulated But Pulled Toward Withdrawal",
  ventral_tied_with_cycling:      "Regulated But Unstable",
};

export const WINDOW_DISPLAY_NAMES = {
  narrow:          "Narrow",
  moderate_narrow: "On the narrower side",
  moderate_wide:   "Has room in it",
  wide:            "Relatively wide",
};

export const RESOURCE_DISPLAY_NAMES = {
  no_tools:      "Starting from scratch",
  limited_tools: "A few tools to build on",
  moderate_tools: "A reasonable toolkit",
  strong_tools:  "A solid foundation",
};

export const SOMATIC_DISPLAY_NAMES = {
  low:      "Building body awareness",
  moderate: "Growing body literacy",
  high:     "Strong body connection",
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