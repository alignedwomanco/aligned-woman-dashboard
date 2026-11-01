import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AnswerField, QuestionText, LiveQuote } from "@/components/audit/AuditFields";
import { PARTS, migrateAnswers } from "@/data/auditQuestions";
const all = PARTS.flatMap(p => p.questions);
const sample = {
  q8:[{what:"x",how_long:{selected:["weeks"],other:""}},{}], q9:{about:"x",who:{selected:["partner"]}},
  q10:{told:"x",voice:"y"}, q13:[{complaint:"a",keeps:"b",if_stopped:"c"}], q18:{sleep:-4,money:-4,work:3},
  q21:{paid:100,unpaid:80}, q22:[{bought:"shoes",feel:{selected:["comfort","other"],other:"bored"}}],
  q23:{filling:[{text:"7am meeting",can_change:"no"}],emptying:[{text:"walks"}]}, q26:{when:{selected:["afternoon"]},reach:{selected:["coffee"]}},
  q27:[{what:"x",type:{selected:["role"]},stop:"yes"}], q30:"shout", q36:"Evenings back", q38:[{obstacle:"money",kind:"real_constraint"}],
  q41:{drains:[{text:"admin",hours:10}],energy:[{text:"teaching",hours:4}]}, q45:{hours:6,wake:{selected:["tired"]}}, q47:{selected:["hours"]},
  q54:{score:7,text:{why:"x"}}, q59:{who:{selected:["no_one_right_now"]}}, b4:[{offer:"Coaching",share:60},{offer:"Workshops",share:50}],
  b5:{love:{selected:["Coaching"]}}, b7:{selected:["other"],other:"x"}, b10:{now:50,want:30}, c9:{logoff:"18:30",check:{selected:["always"]}},
  c10:{miss:[{text:"team"}]}, c11:{move:{selected:["a_break"]},in_way:"x"},
};
const laura = migrateAnswers({q8:"test ",q9:"test ",q10:"test ",q11:"test ",q12:"test ",q13:"test ",q26:"legacy words"}).answers;
let fails = 0; const html = {};
for (const [name, answers] of [["empty",{}],["sample",sample],["migrated",laura]]) {
  for (const q of all) {
    try {
      const out = renderToStaticMarkup(<div>{q.quote && <LiveQuote kind={q.quote} answers={answers}/>}<QuestionText q={q}/><AnswerField q={q} value={answers[q.id]} answers={answers} profileFacts={{}} onChange={()=>{}}/></div>);
      if (name === "sample") html[q.id] = out;
    } catch (e) { fails++; console.log("CRASH", name, q.id, e.message); }
  }
}
console.log("rendered", all.length, "questions x 3 answer sets");
const has = (id, s) => { const ok = (html[id]||"").includes(s); console.log((ok?"PASS ":"FAIL ")+id+" shows: "+s); if(!ok) fails++; };
has("q21","180 of the 168 hours in a week"); has("q21","Worth a second look."); has("b4","110% of your income");
has("q54","Why 7 and not lower?"); has("q19","Your lowest were Sleep and Money, both at -4."); has("q20","Your highest was The work itself, at +3.");
has("q38","Your priority: Evenings back"); has("b5","Workshops"); has("q22","bored"); has("q10","going on with her is..."); has("q30","Good women don");
has("q13","13 and 14"); has("q8","Add another"); has("q8","Remove");
const hidden = !(html.q59||"").includes("When I last told them"); console.log((hidden?"PASS":"FAIL")+" q59 hides When after No one right now"); if(!hidden) fails++;
const b4q = all.find(q=>q.id==="b4");
const b4full = renderToStaticMarkup(<AnswerField q={b4q} value={Array.from({length:6},(_,i)=>({offer:"o"+i}))} answers={{}} onChange={()=>{}}/>);
const noAdd = !b4full.includes("Add another"); console.log((noAdd?"PASS":"FAIL")+" Add another disappears at the row limit (B4, 6)"); if(!noAdd) fails++;
const b5empty = renderToStaticMarkup(<AnswerField q={all.find(q=>q.id==="b5")} value={{}} answers={{}} onChange={()=>{}}/>);
const fb = b5empty.includes("<textarea") && !b5empty.includes('role="checkbox"'); console.log((fb?"PASS":"FAIL")+" B5 shows text boxes when B4 is empty"); if(!fb) fails++;
const leg = renderToStaticMarkup(<AnswerField q={all.find(q=>q.id==="q26")} value={laura.q26} answers={laura} onChange={()=>{}}/>);
const legOk = leg.includes("legacy words"); console.log((legOk?"PASS":"FAIL")+" old words with no new box are shown, not lost"); if(!legOk) fails++;
const m8 = renderToStaticMarkup(<AnswerField q={all.find(q=>q.id==="q8")} value={laura.q8} answers={laura} onChange={()=>{}}/>);
const m8ok = m8.includes(">test </textarea>"); console.log((m8ok?"PASS":"FAIL")+" your saved Q8 shows in the first box"); if(!m8ok) fails++;
const chipsRole = (html.q9||"").includes('role="radio"') && (html.q22||"").includes('role="checkbox"');
console.log((chipsRole?"PASS":"FAIL")+" chips are radios (single) and checkboxes (multi)"); if(!chipsRole) fails++;
console.log(fails ? fails+" FAILURES" : "ALL RENDER CHECKS PASS");
