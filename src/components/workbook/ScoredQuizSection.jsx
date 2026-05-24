import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function ScoredQuizSection({ section, answers = {}, onAnswerChange, isComplete, completedAt, onMarkInProgress }) {
  // Quiz state
  const [quizPhase, setQuizPhase] = useState("intro"); // intro, quiz, results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Extract quiz configuration
  const quizConfig = section.quiz_config || {};
  const questions = section.questions || [];
  const scoring = section.scoring || {};
  const postResultsFields = section.post_results_fields || [];

  // Load saved data on mount
  useEffect(() => {
    const savedData = answers[section.id];
    if (savedData) {
      if (savedData.total_score !== undefined) {
        // Quiz is complete - show results
        setResponses(savedData.responses || {});
        setQuizPhase("results");
      } else if (savedData.responses) {
        // Quiz is incomplete - resume from first unanswered question
        setResponses(savedData.responses || {});
        const answeredCount = Object.keys(savedData.responses).length;
        if (answeredCount < questions.length) {
          setCurrentQuestionIndex(answeredCount);
          setQuizPhase("quiz");
        } else {
          setQuizPhase("results");
        }
      } else {
        // No data - start from intro
        setQuizPhase("intro");
      }
    }
  }, [section.id, answers]);

  // Calculate results
  const results = useMemo(() => {
    if (Object.keys(responses).length < questions.length) return null;

    const responseValues = Object.values(responses);
    const totalScore = responseValues.reduce((sum, val) => sum + (val || 0), 0);

    // Find matched band
    let matchedBand = null;
    if (scoring.bands) {
      matchedBand = scoring.bands.find(band => {
        const range = band.range || {};
        return totalScore >= (range.min || 0) && totalScore <= (range.max || 40);
      });
    }

    // Find highest and lowest dimensions
    let highestScore = 0;
    let lowestScore = 6;
    let highestQuestion = null;
    let lowestQuestion = null;

    questions.forEach((q, idx) => {
      const score = responses[q.id] || 0;
      if (score > highestScore) {
        highestScore = score;
        highestQuestion = q;
      }
      if (score < lowestScore) {
        lowestScore = score;
        lowestQuestion = q;
      }
    });

    // Prepare chart data
    const chartData = questions.map(q => ({
      dimension: q.dimension,
      score: responses[q.id] || 0,
      fullMark: 5,
    }));

    return {
      totalScore,
      matchedBand,
      highestQuestion,
      highestScore,
      lowestQuestion,
      lowestScore,
      chartData,
    };
  }, [responses, questions, scoring.bands]);

  // Handle answer selection
  const handleSelectOption = useCallback((questionId, value) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    const updatedResponses = { ...responses, [questionId]: value };
    setResponses(updatedResponses);

    // Save to workbook
    const sectionData = {
      ...answers[section.id],
      responses: updatedResponses,
    };
    onAnswerChange?.(section.id, sectionData);

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Quiz complete - calculate and save results
        const totalScore = Object.values(updatedResponses).reduce((sum, val) => sum + (val || 0), 0);
        const completedData = {
          ...sectionData,
          total_score: totalScore,
          completed_at: new Date().toISOString(),
        };
        onAnswerChange?.(section.id, completedData);
        setQuizPhase("results");
      }
      setIsTransitioning(false);
    }, 400);
  }, [responses, currentQuestionIndex, questions.length, answers, section.id, onAnswerChange, isTransitioning]);

  // Handle retake
  const handleRetake = useCallback(() => {
    setResponses({});
    setCurrentQuestionIndex(0);
    setQuizPhase("intro");
    // Clear saved data
    onAnswerChange?.(section.id, {});
  }, [section.id, onAnswerChange]);

  // Navigate back to previous question
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Scale labels
  const scaleLabels = quizConfig.scale_labels || [
    { value: 1, label: "Rarely", description: "This almost never applies to me" },
    { value: 2, label: "Occasionally", description: "This happens sometimes but is not my default" },
    { value: 3, label: "Sometimes", description: "This shows up regularly in certain contexts" },
    { value: 4, label: "Often", description: "This is a frequent pattern in my life" },
    { value: 5, label: "Almost Always", description: "This is my default in most situations" },
  ];

  // Render intro phase
  if (quizPhase === "intro") {
    return (
      <div>
        <button
          onClick={() => setQuizPhase("quiz")}
          style={{
            fontFamily: "var(--aw-font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            background: "#4A0E2E",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 100,
            padding: "14px 32px",
            cursor: "pointer",
            transition: "opacity 180ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Begin Assessment
        </button>
      </div>
    );
  }

  // Render quiz phase
  if (quizPhase === "quiz") {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = currentQuestionIndex + 1;

    return (
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Progress indicator */}
        <div style={{
          fontFamily: "var(--aw-font-sans)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#8A7A76",
          marginBottom: 24,
          textAlign: "center",
        }}>
          Question {progress} of {questions.length}
        </div>

        {/* Instruction text (first question only) */}
        {currentQuestionIndex === 0 && quizConfig.instruction_text && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontSize: 14,
            fontStyle: "italic",
            color: "#8A7A76",
            marginBottom: 24,
            textAlign: "center",
          }}>
            {quizConfig.instruction_text}
          </p>
        )}

        {/* Question text */}
        <h3 style={{
          fontFamily: "var(--aw-font-display)",
          fontSize: 24,
          fontWeight: 400,
          color: "#4A0E2E",
          marginBottom: 32,
          lineHeight: 1.3,
        }}>
          {currentQuestion?.text}
        </h3>

        {/* Option cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {scaleLabels.map((option) => {
            const isSelected = responses[currentQuestion?.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                disabled={isTransitioning}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "20px 24px",
                  borderRadius: 12,
                  border: isSelected ? "2px solid #4A0E2E" : "1px solid rgba(74,14,46,0.15)",
                  background: isSelected ? "#4A0E2E" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#3A2A28",
                  cursor: isTransitioning ? "not-allowed" : "pointer",
                  transition: "all 180ms ease",
                  opacity: isTransitioning ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isTransitioning && !isSelected) {
                    e.currentTarget.style.background = "#FDF5F3";
                    e.currentTarget.style.borderColor = "rgba(74,14,46,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTransitioning && !isSelected) {
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.borderColor = "rgba(74,14,46,0.15)";
                  }
                }}
              >
                <div style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  {option.label}
                </div>
                <div style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}>
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            disabled={isTransitioning}
            style={{
              marginTop: 24,
              fontFamily: "var(--aw-font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "transparent",
              color: "#8A7A76",
              border: "none",
              padding: "8px 0",
              cursor: isTransitioning ? "not-allowed" : "pointer",
            }}
          >
            ← Previous Question
          </button>
        )}
      </div>
    );
  }

  // Render results phase
  if (quizPhase === "results" && results) {
    const { totalScore, matchedBand, highestQuestion, highestScore, lowestQuestion, lowestScore, chartData } = results;

    return (
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* 1. Score header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 12,
          }}>
            <span style={{
              fontFamily: "var(--aw-font-display)",
              fontSize: 56,
              fontWeight: 400,
              color: "#4A0E2E",
              lineHeight: 1,
            }}>
              {totalScore}
            </span>
            <span style={{
              fontFamily: "var(--aw-font-sans)",
              fontSize: 14,
              fontWeight: 400,
              color: "#8A7A76",
            }}>
              /40
            </span>
          </div>
          {matchedBand && (
            <>
              <h3 style={{
                fontFamily: "var(--aw-font-display)",
                fontSize: 24,
                fontWeight: 400,
                color: "#4A0E2E",
                marginBottom: 12,
              }}>
                {matchedBand.label}
              </h3>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 15,
                fontWeight: 300,
                color: "#3A2A28",
                lineHeight: 1.7,
              }}>
                {matchedBand.summary}
              </p>
            </>
          )}
        </div>

        {/* 2. Horizontal bar chart */}
        <div style={{ marginBottom: 32 }}>
          {questions.map((q, idx) => {
            const score = responses[q.id] || 0;
            const barColor = score <= 2 ? "#C4847A" : score === 3 ? "#A86460" : "#4A0E2E";
            const barWidth = (score / 5) * 100;

            return (
              <div key={q.id} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#3A2A28",
                  width: 140,
                  flexShrink: 0,
                }}>
                  {q.dimension}
                </span>
                <div style={{
                  flex: 1,
                  height: 8,
                  background: "rgba(74,14,46,0.1)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: 4,
                    transition: "width 600ms ease",
                  }} />
                </div>
                <span style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#3A2A28",
                  width: 32,
                  textAlign: "right",
                }}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3. Radar chart */}
        <div style={{
          width: "100%",
          height: 320,
          marginBottom: 32,
          background: "#0E0208",
          borderRadius: 12,
          padding: 20,
        }}>
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="rgba(196,132,122,0.15)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{
                  fill: "rgba(255,255,255,0.45)",
                  fontSize: 9,
                  fontFamily: "var(--aw-font-sans)",
                }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#C4847A"
                fill="#C4847A"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Band detail */}
        {matchedBand?.detail && (
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontSize: 15,
            fontWeight: 300,
            color: "#3A2A28",
            lineHeight: 1.7,
            marginBottom: 24,
          }}>
            {matchedBand.detail}
          </p>
        )}

        {/* 5. Band caution (conditional) */}
        {matchedBand?.caution && (
          <div style={{
            borderRadius: 12,
            padding: "16px 20px",
            backgroundColor: "#FDF5F3",
            border: "1px solid #E8C9C0",
            marginBottom: 24,
          }}>
            <p style={{
              fontFamily: "var(--aw-font-sans)",
              fontSize: 14,
              fontWeight: 300,
              color: "#3A2A28",
              lineHeight: 1.7,
            }}>
              {matchedBand.caution}
            </p>
          </div>
        )}

        {/* 6. Band action */}
        {matchedBand?.action && (
          <div style={{
            borderRadius: 12,
            padding: "20px 24px",
            backgroundColor: "#4A0E2E",
            marginBottom: 32,
          }}>
            <p style={{
              fontFamily: "var(--aw-font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#E8B4AE",
              marginBottom: 12,
            }}>
              What to Focus On
            </p>
            <p style={{
              fontFamily: "var(--aw-font-sans)",
              fontSize: 14,
              fontWeight: 300,
              color: "#FFFFFF",
              lineHeight: 1.7,
            }}>
              {matchedBand.action}
            </p>
          </div>
        )}

        {/* 7. Highest and lowest dimension cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}>
          {highestQuestion && (
            <div style={{
              padding: 20,
              borderRadius: 12,
              background: "#FDF5F3",
              border: "1px solid rgba(196,132,122,0.25)",
            }}>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#C4847A",
                marginBottom: 8,
              }}>
                Highest Load
              </p>
              <p style={{
                fontFamily: "var(--aw-font-display)",
                fontSize: 18,
                fontWeight: 400,
                color: "#4A0E2E",
                marginBottom: 4,
              }}>
                {highestQuestion.dimension}
              </p>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 14,
                fontWeight: 600,
                color: "#3A2A28",
                marginBottom: 12,
              }}>
                {highestScore} / 5
              </p>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 13,
                fontWeight: 300,
                color: "#3A2A28",
                lineHeight: 1.6,
              }}>
                This is where your energy is leaking most. Start your discernment practice here.
              </p>
            </div>
          )}

          {lowestQuestion && (
            <div style={{
              padding: 20,
              borderRadius: 12,
              background: "#FDF5F3",
              border: "1px solid rgba(196,132,122,0.25)",
            }}>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#C4847A",
                marginBottom: 8,
              }}>
                Relative Strength
              </p>
              <p style={{
                fontFamily: "var(--aw-font-display)",
                fontSize: 18,
                fontWeight: 400,
                color: "#4A0E2E",
                marginBottom: 4,
              }}>
                {lowestQuestion.dimension}
              </p>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 14,
                fontWeight: 600,
                color: "#3A2A28",
                marginBottom: 12,
              }}>
                {lowestScore} / 5
              </p>
              <p style={{
                fontFamily: "var(--aw-font-sans)",
                fontSize: 13,
                fontWeight: 300,
                color: "#3A2A28",
                lineHeight: 1.6,
              }}>
                You have healthier boundaries here. Notice what makes this area different.
              </p>
            </div>
          )}
        </div>

        {/* 8. Per-question dimension cards */}
        <div style={{ marginBottom: 32 }}>
          {questions.map((q, idx) => {
            const score = responses[q.id] || 0;
            const interpretation = score <= 2 ? q.interpretation?.low : q.interpretation?.high;
            const barWidth = (score / 5) * 100;

            return (
              <div key={q.id} style={{
                padding: 16,
                borderRadius: 12,
                background: "#FFFFFF",
                border: "1px solid rgba(74,14,46,0.08)",
                marginBottom: 12,
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}>
                  <p style={{
                    fontFamily: "var(--aw-font-sans)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#4A0E2E",
                  }}>
                    {q.dimension}
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <div style={{
                      width: 100,
                      height: 6,
                      background: "rgba(74,14,46,0.1)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        background: score <= 2 ? "#C4847A" : score === 3 ? "#A86460" : "#4A0E2E",
                        borderRadius: 3,
                      }} />
                    </div>
                    <span style={{
                      fontFamily: "var(--aw-font-sans)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#3A2A28",
                    }}>
                      {score} / 5
                    </span>
                  </div>
                </div>
                {interpretation && (
                  <p style={{
                    fontFamily: "var(--aw-font-sans)",
                    fontSize: 13,
                    fontWeight: 300,
                    color: "#3A2A28",
                    lineHeight: 1.6,
                  }}>
                    {interpretation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 9. Core insight callout */}
        <div style={{
          borderRadius: 12,
          padding: "24px 28px",
          background: "#0E0208",
          marginBottom: 32,
        }}>
          <p style={{
            fontFamily: "var(--aw-font-display)",
            fontSize: 18,
            fontWeight: 400,
            color: "#FFFFFF",
            lineHeight: 1.5,
            marginBottom: 12,
          }}>
            Emotional labour is not a personality trait. It is a learned pattern. And learned patterns can be updated.
          </p>
          <p style={{
            fontFamily: "var(--aw-font-sans)",
            fontSize: 13,
            fontWeight: 300,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
          }}>
            The rest of this workbook gives you the tools to do exactly that. Starting with discernment: the ability to observe behaviour without absorbing it.
          </p>
        </div>

        {/* 10. Reflection textarea */}
        {postResultsFields.map((field) => {
          const fieldValue = answers[`${section.id}_${field.id}`] || "";
          return (
            <div key={field.id} style={{ marginBottom: 32 }}>
              {field.label && (
                <p style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4A0E2E",
                  marginBottom: 8,
                }}>
                  {field.label}
                </p>
              )}
              {field.helper && (
                <p style={{
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 12,
                  fontStyle: "italic",
                  color: "#8A7A76",
                  marginBottom: 12,
                }}>
                  {field.helper}
                </p>
              )}
              <textarea
                rows={field.rows || 4}
                value={fieldValue}
                onChange={(e) => onAnswerChange?.(`${section.id}_${field.id}`, e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: "1px solid rgba(74,14,46,0.15)",
                  padding: "16px 20px",
                  fontFamily: "var(--aw-font-sans)",
                  fontSize: 14,
                  fontWeight: 300,
                  color: "#3A2A28",
                  lineHeight: 1.7,
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 180ms ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C4847A";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(74,14,46,0.15)";
                }}
                placeholder="Write here..."
              />
            </div>
          );
        })}

        {/* Retake button */}
        <button
          onClick={handleRetake}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--aw-font-sans)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            background: "transparent",
            color: "#4A0E2E",
            border: "1px solid rgba(74,14,46,0.22)",
            borderRadius: 100,
            padding: "12px 24px",
            cursor: "pointer",
            transition: "all 180ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(74,14,46,0.04)";
            e.currentTarget.style.borderColor = "rgba(74,14,46,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(74,14,46,0.22)";
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retake Assessment
        </button>
      </div>
    );
  }

  return null;
}