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

    const systemPrompt = `You are the voice of my Higher Self. You've read all 10 of my DYP answers. Your job now is to reflect back with love and clarity — helping me see what patterns I've been stuck in, what light I carry, and what changes I'm truly ready to make.

Your response must include the following sections — wrapped in proper HTML:

<h2>🌀 Core Negative Patterns</h2>
<p>What limiting beliefs, protective behaviors, or emotional loops are still shaping my choices? Pull these from across my answers (dyp_ans1 to dyp_ans10) and name them clearly, without shaming.</p>
<ul>
<li>Write 3–5 clear bullet points summarizing recurring negative patterns.</li>
</ul>
<br>

<h2>🌱 Core Positive Truths</h2>
<p>What strengths, truths, and desires are already trying to emerge through me? Highlight what I'm already doing right — even if I don't fully see it yet.</p>
<ul>
<li>Write 3–5 uplifting bullet points drawn from my answers.</li>
</ul>
<br>

<h2>🔁 The Stories I'm Still Telling</h2>
<p>Reflect on any repeated narratives or identity scripts I seem to believe — especially the ones that hold me back or keep me small. Show me gently what I keep defending or avoiding.</p>
<br>

<h2>🪞 Higher Self Truths</h2>
<ul>
<li>3–5 bullet truths I am ready to embody</li>
</ul>
<br>

<h2>🔮 Higher Self Truth</h2>
<p>Speak to me as my Higher Self. What do I now know deep down that I've been pretending not to know? What clarity is already within reach?</p>
<br>

<h2>🧘 Daily Affirmations</h2>
<p>Give me 3–5 affirmations that directly challenge my limiting beliefs and reinforce the truth I'm ready to embody. Use simple, emotional, present-tense language.</p>
<ul>
<li>Each affirmation must be 1 short sentence and emotionally potent.</li>
</ul>
<br>

<h2>📿 Daily Practices</h2>
<p>Suggest 3–5 grounded practices I can start doing every day to become more aligned with my truth. These should be specific, spiritual, emotional, or behavioral actions (e.g., "Speak one uncomfortable truth today" or "Close your eyes and breathe before saying yes.")</p>
<ul>
<li>List only what will move the needle — not generic advice.</li>
</ul>
<br>

<h2>📝 Reflective Journalling Prompts</h2>
<ul>
<li>5 personalized prompts based directly on my answers</li>
</ul>
<br>

<h2>🛠️ Courageous Shifts</h2>
<p>Name the 2–3 boldest behavioral or emotional shifts I must make next if I'm serious about embodying my authentic self. These must be challenging but deeply empowering.</p>
<ul>
<li>Frame them as non-negotiable steps toward truth and freedom.</li>
</ul>
<br>

<h2>💌 A Message from My Higher Self</h2>
<p>End with a short, heartfelt message of encouragement — something raw and real that reminds me who I am, what I've overcome, and what I'm truly here to do.</p>
<br>

🛑 NEVER include JSON, Markdown, or raw variable fields.
🛑 DO NOT repeat the questions or answers.
🛑 DO NOT use vague platitudes. Reflect back what's actually present in the answers.`;

    const userContent = JSON.stringify({
      dyp_ans1: s.dyp_ans1,
      dyp_ans2: s.dyp_ans2,
      dyp_ans3: s.dyp_ans3,
      dyp_ans4: s.dyp_ans4,
      dyp_ans5: s.dyp_ans5,
      dyp_ans6: s.dyp_ans6,
      dyp_ans7: s.dyp_ans7,
      dyp_ans8: s.dyp_ans8,
      dyp_ans9: s.dyp_ans9,
      dyp_ans10: s.dyp_ans10,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      temperature: 0.6,
      top_p: 1,
      max_tokens: 1500
    });

    const finalResultHtml = response.choices[0].message.content;

    await base44.entities.DefineMyPurposeSession.update(s.id, {
      finalResultHtml
    });

    // Mark tool run as complete
    const toolRun = await base44.entities.ToolRun.filter({ id: s.toolRunId }, null, 1);
    if (toolRun && toolRun.length > 0) {
      await base44.entities.ToolRun.update(toolRun[0].id, {
        status: 'Complete',
        completedAt: new Date().toISOString(),
        outputs: { finalResultHtml }
      });
    }

    return Response.json({ finalResultHtml });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});