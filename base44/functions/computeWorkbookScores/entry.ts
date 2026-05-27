import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { entity_id, data } = payload;

    // Only process if is_complete is true
    if (!data?.is_complete) {
      return Response.json({ skipped: true, reason: "not complete" });
    }

    const workbookResponseId = entity_id;
    const answers = data.answers || {};
    const workbookId = data.workbook_id;

    if (!workbookId) {
      return Response.json({ skipped: true, reason: "no workbook_id" });
    }

    // Look up the workbook to get scoring_logic
    const workbooks = await base44.asServiceRole.entities.Workbook.filter({ id: workbookId });
    const workbook = workbooks?.[0];

    if (!workbook || workbook.scoring_logic !== "nervous_system_baseline_v1") {
      return Response.json({ skipped: true, reason: "no matching scoring_logic" });
    }

    // ── 1. DOMINANT STATE ──────────────────────────────────────────────────
    const stateScores = {
      ventral_vagal:  Number(answers.ventral_vagal_frequency)  || 0,
      sympathetic:    Number(answers.sympathetic_frequency)     || 0,
      dorsal_vagal:   Number(answers.dorsal_vagal_frequency)    || 0,
      cycling:        Number(answers.cycling_frequency)         || 0,
    };

    // Find max value
    const maxScore = Math.max(...Object.values(stateScores));

    // Get all states at max
    const topStates = Object.entries(stateScores)
      .filter(([, v]) => v === maxScore)
      .map(([k]) => k);

    let dominant_state;
    if (topStates.length === 1) {
      dominant_state = topStates[0];
    } else if (topStates.includes("sympathetic") && topStates.includes("dorsal_vagal")) {
      // Sympathetic + dorsal_vagal tie → cycling
      dominant_state = "cycling";
    } else if (topStates.includes("ventral_vagal")) {
      // ventral_vagal ties with any other → other wins
      const nonVentral = topStates.filter(s => s !== "ventral_vagal");
      dominant_state = nonVentral.length === 1 ? nonVentral[0] : "cycling";
    } else {
      // Any other tie → pick alphabetically as fallback
      dominant_state = topStates.sort()[0];
    }

    // ── 2. WINDOW OF TOLERANCE ─────────────────────────────────────────────
    const recoverySpeed     = Number(answers.recovery_speed)     || 0;
    const triggerThreshold  = Number(answers.trigger_threshold)  || 0;
    const windowAvg = (recoverySpeed + triggerThreshold) / 2;

    let window_classification;
    if (windowAvg <= 2) {
      window_classification = "narrow";
    } else if (windowAvg <= 3) {
      window_classification = "moderate_narrow";
    } else if (windowAvg <= 4) {
      window_classification = "moderate_wide";
    } else {
      window_classification = "wide";
    }

    // ── 3. REGULATION RESOURCES ────────────────────────────────────────────
    const regulationTools = Array.isArray(answers.regulation_tools) ? answers.regulation_tools : [];
    const hasNothing = regulationTools.includes("nothing");
    const toolCount = hasNothing ? 0 : regulationTools.length;

    let resource_classification;
    if (toolCount === 0) {
      resource_classification = "no_tools";
    } else if (toolCount <= 2) {
      resource_classification = "limited_tools";
    } else if (toolCount <= 4) {
      resource_classification = "moderate_tools";
    } else {
      resource_classification = "strong_tools";
    }

    // ── 4. SOMATIC AWARENESS ───────────────────────────────────────────────
    const stressBodyLocations   = Array.isArray(answers.stress_body_locations)   ? answers.stress_body_locations   : [];
    const shutdownBodyLocations = Array.isArray(answers.shutdown_body_locations)  ? answers.shutdown_body_locations  : [];
    const safetyBodySignals     = Array.isArray(answers.safety_body_signals)      ? answers.safety_body_signals      : [];
    const somaticTotal = stressBodyLocations.length + shutdownBodyLocations.length + safetyBodySignals.length;

    const safetyMeaningHasText  = typeof answers.safety_meaning === "string"    && answers.safety_meaning.trim().length > 0;
    const stressBodyDetailHasText = typeof answers.stress_body_detail === "string" && answers.stress_body_detail.trim().length > 0;

    let somatic_classification;
    if (somaticTotal >= 9 || (safetyMeaningHasText && somaticTotal >= 6)) {
      somatic_classification = "high";
    } else if (somaticTotal >= 4 || stressBodyDetailHasText) {
      somatic_classification = "moderate";
    } else {
      somatic_classification = "low";
    }

    // ── 5. DOMINANT STATE VARIANT & OSCILLATING ───────────────────────────
    const is_oscillating = stateScores.sympathetic >= 4 && stateScores.dorsal_vagal >= 4;

    // Check if ventral_vagal was tied with the winner in the original topStates
    const ventral_tied_with_winner =
      topStates.includes("ventral_vagal") && topStates.includes(dominant_state) && dominant_state !== "ventral_vagal";

    let dominant_state_variant;
    if (is_oscillating) {
      dominant_state_variant = "oscillating";
    } else if (ventral_tied_with_winner) {
      dominant_state_variant = "ventral_tied_with_" + dominant_state;
    } else {
      dominant_state_variant = dominant_state;
    }

    // ── Write scores back ──────────────────────────────────────────────────
    const computed_scores = {
      // Core classifications (preserved exactly)
      dominant_state,
      window_classification,
      resource_classification,
      somatic_classification,

      // Extended variant fields
      dominant_state_variant,
      is_oscillating,

      // Raw frequency values
      state_frequencies: {
        ventral_vagal: stateScores.ventral_vagal,
        sympathetic:   stateScores.sympathetic,
        dorsal_vagal:  stateScores.dorsal_vagal,
        cycling:       stateScores.cycling,
      },
      dominant_state_frequency: stateScores[dominant_state] ?? maxScore,

      // Raw numeric scores
      window_score:    Math.round(windowAvg * 100) / 100,
      resource_score:  toolCount,
      somatic_total:   somaticTotal,

      // Top body location samples
      top_stress_locations: stressBodyLocations.slice(0, 3),
      top_safety_signals:   safetyBodySignals.slice(0, 3),

      // Portrait key map (used for UI portrait selection)
      portrait_keys: {
        dominant:  dominant_state_variant,
        window:    window_classification,
        resources: resource_classification,
        somatic:   somatic_classification,
      },

      // Metadata
      scoring_version: "nervous_system_baseline_v1",
      computed_at:     new Date().toISOString(),
    };

    await base44.asServiceRole.entities.WorkbookResponse.update(workbookResponseId, {
      computed_scores,
    });

    return Response.json({ success: true, computed_scores });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});