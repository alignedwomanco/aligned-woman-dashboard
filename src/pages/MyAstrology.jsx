import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, X, Play, Clock, BookOpen } from "lucide-react";
import Big6Card from "@/components/astrology/Big6Card";
import Big6DetailDrawer from "@/components/astrology/Big6DetailDrawer";
import CurrentThemeCard from "@/components/astrology/CurrentThemeCard";
import { createPageUrl } from "@/utils";

export default function MyAstrology() {
  const [currentUser, setCurrentUser] = useState(null);
  const [todaysState, setTodaysState] = useState(null);
  const [big6Data, setBig6Data] = useState(null);
  const [currentThemes, setCurrentThemes] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [lauraiQuestion, setLauraiQuestion] = useState("");
  const [lauraiResponse, setLauraiResponse] = useState("");
  const [isLauraiThinking, setIsLauraiThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: diagnosticSession } = useQuery({
    queryKey: ["diagnosticSession"],
    queryFn: async () => {
      const sessions = await base44.entities.DiagnosticSession.filter(
        { isComplete: true },
        "-created_date",
        1
      );
      return sessions[0] || null;
    },
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
    };
    loadUser();
  }, []);

  // Generate Today's State
  useEffect(() => {
    const generateTodaysState = async () => {
      if (!diagnosticSession || !currentUser) return;

      const prompt = `You are generating today's astrological state for ${currentUser.full_name}.

USER NATAL CHART:
- Sun: ${diagnosticSession.astrologyProfile?.sunSign || "Sagittarius"}
- Moon: ${diagnosticSession.astrologyProfile?.moonSign || "Leo"}
- Rising: ${diagnosticSession.astrologyProfile?.risingSign || "Virgo"}

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

GENERATE TODAY'S STATE:
1. A 2-3 line paragraph about today's energetic state as it interacts with their chart
2. Three bullet cues:
   - Focus (what to prioritize)
   - Energy (how their energy might feel)
   - Emotional tone (the mood of the day)

REQUIREMENTS:
- No jargon, no doom language
- Personal and grounded
- Actionable, not predictive
- Reference transits internally but don't show symbols
- Make it feel like guidance, not fortune-telling

Format as JSON.`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              narrative: { type: "string" },
              focus: { type: "string" },
              energy: { type: "string" },
              emotionalTone: { type: "string" }
            }
          }
        });
        setTodaysState(result);
      } catch (error) {
        console.error("Failed to generate today's state:", error);
      }
    };

    generateTodaysState();
  }, [diagnosticSession, currentUser]);

  // Generate Big 6 Data
  useEffect(() => {
    const generateBig6 = async () => {
      if (!diagnosticSession) return;

      const prompt = `Generate Big 6 astrological blueprint for a user with:
- Sun: ${diagnosticSession.astrologyProfile?.sunSign || "Sagittarius"}
- Moon: ${diagnosticSession.astrologyProfile?.moonSign || "Leo"}
- Rising: ${diagnosticSession.astrologyProfile?.risingSign || "Virgo"}
- Mercury: Sagittarius (default)
- Venus: Scorpio (default)
- Mars: Aries (default)

For each placement, provide:
1. A 1-line descriptor (like "You regulate through expression")
2. What this means (2-3 sentences, plain language)
3. When stressed (how this shows up under pressure)
4. When aligned (what it looks like when supported)
5. Supportive practice (one micro-practice or awareness cue)

Format as JSON with keys: Sun, Moon, Rising, Mercury, Venus, Mars
Each should have: sign, descriptor, whatThisMeans, whenStressed, whenAligned, supportivePractice`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              Sun: {
                type: "object",
                properties: {
                  sign: { type: "string" },
                  descriptor: { type: "string" },
                  whatThisMeans: { type: "string" },
                  whenStressed: { type: "string" },
                  whenAligned: { type: "string" },
                  supportivePractice: { type: "string" }
                }
              },
              Moon: { type: "object" },
              Rising: { type: "object" },
              Mercury: { type: "object" },
              Venus: { type: "object" },
              Mars: { type: "object" }
            }
          }
        });
        setBig6Data(result);
      } catch (error) {
        console.error("Failed to generate Big 6:", error);
      }
    };

    generateBig6();
  }, [diagnosticSession]);

  // Generate Current Themes
  useEffect(() => {
    const generateThemes = async () => {
      if (!diagnosticSession) return;

      const prompt = `Generate 3-4 current astrological themes for a user with:
- Sun ${diagnosticSession.astrologyProfile?.sunSign || "Sagittarius"}
- Moon ${diagnosticSession.astrologyProfile?.moonSign || "Leo"}
- Current concerns: ${diagnosticSession.concerns?.join(", ") || "personal growth"}

Each theme should explain "what life is asking of you right now" and include:
1. Title (short, clear)
2. Summary (2-3 lines)
3. Deeper explanation (3-4 sentences)
4. When misaligned (what this looks like when you resist)
5. When aligned (what this looks like when you work with it)
6. Suggestion (one practice or course theme)

Themes might include:
- Emotional focus
- Relationship patterns
- Career/visibility lessons
- Boundaries and energy
- Identity upgrades
- Rest vs action

Format as JSON array.`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              themes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    deeperExplanation: { type: "string" },
                    whenMisaligned: { type: "string" },
                    whenAligned: { type: "string" },
                    suggestion: { type: "string" }
                  }
                }
              }
            }
          }
        });
        setCurrentThemes(result.themes || []);
      } catch (error) {
        console.error("Failed to generate themes:", error);
      }
    };

    generateThemes();
  }, [diagnosticSession]);

  // Generate Course Recommendations
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!diagnosticSession || allCourses.length === 0 || currentThemes.length === 0) return;

      const prompt = `Based on current astrological themes:
${currentThemes.map(t => `- ${t.title}`).join('\n')}

And available courses:
${allCourses.slice(0, 10).map(c => `- ${c.title}`).join('\n')}

Recommend 2-3 courses that align with the user's current astrology.
For each recommendation, explain why it's aligned (1 line).

Format as JSON with course titles and reasons.`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    courseTitle: { type: "string" },
                    reason: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const matched = result.recommendations?.map(rec => {
          const course = allCourses.find(c => c.title.toLowerCase().includes(rec.courseTitle.toLowerCase()) || rec.courseTitle.toLowerCase().includes(c.title.toLowerCase()));
          return course ? { ...course, reason: rec.reason } : null;
        }).filter(Boolean) || [];

        setRecommendedCourses(matched.slice(0, 3));
      } catch (error) {
        console.error("Failed to generate recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateRecommendations();
  }, [diagnosticSession, allCourses, currentThemes]);

  // Ask LaurAI
  const askLaurAI = async (question) => {
    if (!question.trim() || !diagnosticSession) return;
    
    setIsLauraiThinking(true);
    setLauraiResponse("");
    
    try {
      const contextPrompt = `You are LaurAI answering an astrology question.

USER CONTEXT:
- Page: My Astrology
- Sun: ${diagnosticSession.astrologyProfile?.sunSign || "Sagittarius"}
- Moon: ${diagnosticSession.astrologyProfile?.moonSign || "Leo"}
- Rising: ${diagnosticSession.astrologyProfile?.risingSign || "Virgo"}
- Current Date: ${new Date().toLocaleDateString()}
- Today's Focus: ${todaysState?.focus || "Clarity and vision"}

USER QUESTION: "${question}"

RESPONSE REQUIREMENTS:
- Give a direct answer
- Explain what this means practically TODAY
- Suggest one thing to try
- Suggest one thing to avoid (if relevant)
- Connect to self-trust, regulation, alignment, or choice
- NO astrology lectures or abstract symbolism
- Make it personal and grounded (2-3 paragraphs)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt
      });
      
      setLauraiResponse(response);
    } catch (error) {
      console.error("LaurAI error:", error);
      setLauraiResponse("I'm having trouble connecting right now. Please try again.");
    } finally {
      setIsLauraiThinking(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setLauraiQuestion(question);
    askLaurAI(question);
  };

  const handleCustomQuestion = () => {
    askLaurAI(lauraiQuestion);
  };

  const handlePlanetClick = (planetName) => {
    if (big6Data && big6Data[planetName]) {
      setSelectedPlanet({
        planet: planetName,
        ...big6Data[planetName]
      });
    }
  };

  if (isLoading || !todaysState) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Calculating your astrological state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#F3E8FF' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Astrology</h1>
          </div>
        </div>

        {/* Today's State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Today's State</CardTitle>
              <p className="text-white/80 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </CardHeader>
            <CardContent>
              <p className="text-white/95 leading-relaxed mb-6">{todaysState.narrative}</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-white/70 mb-1">Focus</p>
                  <p className="text-sm font-medium">{todaysState.focus}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-white/70 mb-1">Energy</p>
                  <p className="text-sm font-medium">{todaysState.energy}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-xs text-white/70 mb-1">Emotional Tone</p>
                  <p className="text-sm font-medium">{todaysState.emotionalTone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ask LaurAI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ask LaurAI</p>
                  <p className="text-xs text-gray-600">Get personalized astrological guidance</p>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="flex gap-2 flex-wrap mb-4">
                <button
                  onClick={() => handleQuickQuestion("What should I focus on today?")}
                  className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  What should I focus on today?
                </button>
                <button
                  onClick={() => handleQuickQuestion("How can I work with today's energy?")}
                  className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  How can I work with today's energy?
                </button>
                <button
                  onClick={() => handleQuickQuestion("What does this mean for my relationships?")}
                  className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  What about my relationships?
                </button>
              </div>

              {/* Custom Question */}
              <div className="flex gap-2 mb-4">
                <Input
                  value={lauraiQuestion}
                  onChange={(e) => setLauraiQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
                  placeholder="Ask your own question..."
                  className="flex-1 bg-white"
                  disabled={isLauraiThinking}
                />
                <Button 
                  onClick={handleCustomQuestion}
                  disabled={isLauraiThinking || !lauraiQuestion.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {isLauraiThinking ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Response */}
              <AnimatePresence>
                {lauraiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">
                      {lauraiResponse}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Core Blueprint (Big 6) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Core Blueprint</h2>
          <p className="text-gray-600 mb-6">These placements form your astrological foundation. Tap to explore each one.</p>
          
          {big6Data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(big6Data).map((planet) => (
                <Big6Card
                  key={planet}
                  planet={planet}
                  sign={big6Data[planet].sign}
                  descriptor={big6Data[planet].descriptor}
                  onClick={() => handlePlanetClick(planet)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Current Themes */}
        {currentThemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Themes</h2>
            <p className="text-gray-600 mb-6">What life is asking of you right now</p>
            
            {currentThemes.map((theme, index) => (
              <CurrentThemeCard
                key={index}
                theme={theme}
                isLast={index === currentThemes.length - 1}
              />
            ))}
          </motion.div>
        )}

        {/* Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended For You</h2>
            <p className="text-gray-600 mb-6">Aligned with your current astrology</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-xs text-purple-600 mb-3">{course.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.durationMinutes || "20"} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Video
                      </span>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      onClick={() => window.location.href = createPageUrl("ModulePlayer") + `?courseId=${course.id}`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Big 6 Detail Drawer */}
        {selectedPlanet && (
          <Big6DetailDrawer
            isOpen={!!selectedPlanet}
            onClose={() => setSelectedPlanet(null)}
            planetData={selectedPlanet}
            courses={allCourses.filter(c => 
              (selectedPlanet.planet === 'Moon' && (c.title.toLowerCase().includes('emotion') || c.title.toLowerCase().includes('nervous'))) ||
              (selectedPlanet.planet === 'Venus' && (c.title.toLowerCase().includes('relationship') || c.title.toLowerCase().includes('worth'))) ||
              (selectedPlanet.planet === 'Mars' && (c.title.toLowerCase().includes('boundaries') || c.title.toLowerCase().includes('energy')))
            ).slice(0, 2)}
          />
        )}
      </div>
    </div>
  );
}