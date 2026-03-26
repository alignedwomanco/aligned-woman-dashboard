import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    const session = await base44.entities.DefineMyPurposeSession.filter({ id: sessionId }, null, 1);
    if (!session || session.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const s = session[0];

    const systemPrompt = `You are a sharp, soul-aligned assistant helping me deconstruct the masks I wear, the roles I play, and the stories I tell myself. You do this by analyzing my last 9 answers and asking one final, cutting, compassionate question that reveals deeper truth.

You only return:
<h4>Mirror Summary:</h4>
<p>A paragraph that reflects back the deeper emotional themes, patterns, or contradictions you noticed across my answers (dyp_ans1 to dyp_ans9). Call out self-protective narratives, identity patterns, or illusions gently but truthfully.</p>

<h4>Final Question (DYP Q10):</h4>
<p>One personalized, soul-revealing question that pushes beneath the mask I'm most attached to — so I can finally see and free myself from it. This must be based on dyp_ans9, but shaped by the full context of dyp_ans1 to dyp_ans9. It must NOT repeat any earlier question. It must reveal what I'm still avoiding.</p>

🛑 Do not output anything else. No labels, intros, explanations, or JSON.`;

    const userContent = JSON.stringify({
      dyp_q1: s.dyp_q1,
      dyp_ans1: s.dyp_ans1,
      dyp_q2: s.dyp_q2,
      dyp_ans2: s.dyp_ans2,
      dyp_q3: s.dyp_q3,
      dyp_ans3: s.dyp_ans3,
      dyp_q4: s.dyp_q4,
      dyp_ans4: s.dyp_ans4,
      dyp_q5: s.dyp_q5,
      dyp_ans5: s.dyp_ans5,
      dyp_q6: s.dyp_q6,
      dyp_ans6: s.dyp_ans6,
      dyp_q7: s.dyp_q7,
      dyp_ans7: s.dyp_ans7,
      dyp_q8: s.dyp_q8,
      dyp_ans8: s.dyp_ans8,
      dyp_q9: s.dyp_q9,
      dyp_ans9: s.dyp_ans9,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      temperature: 0.55,
      top_p: 1,
      max_tokens: 800
    });

    const html = response.choices[0].message.content;

    // Extract mirror summary and final question from HTML
    const mirrorMatch = html.match(/<h4>Mirror Summary:<\/h4>\s*<p>(.*?)<\/p>/s);
    const questionMatch = html.match(/<h4>Final Question \(DYP Q10\):<\/h4>\s*<p>(.*?)<\/p>/s);

    const mirrorSummary = mirrorMatch ? mirrorMatch[1] : '';
    const finalQuestion = questionMatch ? questionMatch[1] : '';

    await base44.entities.DefineMyPurposeSession.update(s.id, {
      mirrorSummaryHtml: html,
      finalQuestionHtml: finalQuestion,
      dyp_q10: finalQuestion,
      currentStep: 10
    });

    return Response.json({ 
      mirrorSummaryHtml: html,
      finalQuestion 
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});