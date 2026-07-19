import { useState, useEffect, useMemo } from "react";
import { Check, RotateCcw, ArrowRight, Trophy } from "lucide-react";

const TOTAL_SETS = 5;
const QUESTIONS_PER_SET = 10;

function makeSet() {
  const used = new Set();
  const qs = [];
  while (qs.length < QUESTIONS_PER_SET) {
    const a = Math.floor(Math.random() * 11) + 2; // 2-12
    const b = Math.floor(Math.random() * 11) + 2; // 2-12
    const key = a <= b ? `${a}x${b}` : `${b}x${a}`;
    if (used.has(key)) continue;
    used.add(key);
    qs.push({ a, b, answer: a * b });
  }
  return qs;
}

function emptyResults() {
  return Array(QUESTIONS_PER_SET).fill(null); // null = unchecked, true/false after check
}

export default function TimesTablesTest() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [setIndex, setSetIndex] = useState(0);
  const [questions, setQuestions] = useState(() => makeSet());
  const [inputs, setInputs] = useState(Array(QUESTIONS_PER_SET).fill(""));
  const [locked, setLocked] = useState(Array(QUESTIONS_PER_SET).fill(false));
  const [results, setResults] = useState(emptyResults());
  const [phase, setPhase] = useState("answering"); // answering | checked
  const [setScores, setSetScores] = useState(Array(TOTAL_SETS).fill(null));
  const [finished, setFinished] = useState(false);

  const wrongCount = useMemo(
    () => results.filter((r) => r === false).length,
    [results]
  );
  const checkedCount = useMemo(
    () => results.filter((r) => r !== null).length,
    [results]
  );
  const correctCount = useMemo(
    () => results.filter((r) => r === true).length,
    [results]
  );

  const totalSoFar = setScores.reduce((s, v) => s + (v ?? 0), 0);
  const setsAttempted = setScores.filter((v) => v !== null).length;

  function handleInputChange(i, val) {
    if (locked[i]) return;
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  }

  function handleCheck() {
    const next = [...results];
    const nextLocked = [...locked];
    inputs.forEach((val, i) => {
      if (nextLocked[i]) return; // already locked from a prior correct answer
      const num = parseInt(val, 10);
      const correct = num === questions[i].answer;
      next[i] = correct;
      if (correct) nextLocked[i] = true;
    });
    setResults(next);
    setLocked(nextLocked);
    setPhase("checked");
  }

  function handleCorrection() {
    // unlock only the wrong ones, clear their input, go back to answering
    const nextInputs = [...inputs];
    results.forEach((r, i) => {
      if (r === false) nextInputs[i] = "";
    });
    setInputs(nextInputs);
    setPhase("answering");
  }

  function handleNext() {
    const scored = [...setScores];
    scored[setIndex] = correctCount;
    setSetScores(scored);

    if (setIndex === TOTAL_SETS - 1) {
      setFinished(true);
      return;
    }
    const nextIdx = setIndex + 1;
    setSetIndex(nextIdx);
    setQuestions(makeSet());
    setInputs(Array(QUESTIONS_PER_SET).fill(""));
    setLocked(Array(QUESTIONS_PER_SET).fill(false));
    setResults(emptyResults());
    setPhase("answering");
  }

  function handleRestart() {
    setSetIndex(0);
    setQuestions(makeSet());
    setInputs(Array(QUESTIONS_PER_SET).fill(""));
    setLocked(Array(QUESTIONS_PER_SET).fill(false));
    setResults(emptyResults());
    setPhase("answering");
    setSetScores(Array(TOTAL_SETS).fill(null));
    setFinished(false);
  }

  const allAnswered = inputs.every((v) => v.trim() !== "");
  const canCheck = phase === "answering" && allAnswered;
  const canCorrect = phase === "checked" && wrongCount > 0;
  const canNext = phase === "checked" && wrongCount === 0;

  const fontDisplay = { fontFamily: "'Baloo 2', sans-serif" };
  const fontMono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div
      className="min-h-screen w-full flex justify-center py-8 px-4"
      style={{
        background: "#EFEAE0",
        backgroundImage:
          "linear-gradient(#D8DEE8 1px, transparent 1px), linear-gradient(90deg, #D8DEE8 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
              style={{ ...fontDisplay, color: "#1F2A44" }}
            >
              Math Test - Multiplication
            </div>
            <div
              className="text-sm mt-1"
              style={{ ...fontMono, color: "#5B6B85" }}
            >
              Set {setIndex + 1} of {TOTAL_SETS}
            </div>
          </div>

          {/* Mark result, top right */}
          <div
            className="rounded-2xl px-4 py-2 shadow-sm text-right"
            style={{
              background: "#1F2A44",
              color: "#F4B942",
              minWidth: "112px",
              transform: "rotate(1deg)",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-widest opacity-80"
              style={fontMono}
            >
              This set
            </div>
            <div className="text-2xl font-bold leading-tight" style={fontDisplay}>
              {phase === "checked" ? `${correctCount}/${QUESTIONS_PER_SET}` : `–/${QUESTIONS_PER_SET}`}
            </div>
            <div
              className="text-[10px] mt-1 opacity-80"
              style={fontMono}
            >
              Total: {totalSoFar}/{setsAttempted * QUESTIONS_PER_SET || 0}
            </div>
          </div>
        </div>

        {!finished ? (
          <>
            {/* Question grid */}
            <div
              className="rounded-2xl p-5 sm:p-6 shadow-md"
              style={{ background: "#FBF8F2", border: "1px solid #D8DEE8" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {questions.map((q, i) => {
                  const result = results[i];
                  const isWrong = result === false;
                  const isCorrect = result === true;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      {/* question number badge */}
                      <div
                        className="relative flex items-center justify-center shrink-0"
                        style={{ width: 30, height: 30 }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{ ...fontMono, color: "#1F2A44" }}
                        >
                          {i + 1}
                        </span>
                        {isWrong && (
                          <span
                            className="absolute inset-[-4px] rounded-full"
                            style={{
                              border: "2.5px solid #D14343",
                              transform: "rotate(-6deg)",
                            }}
                          />
                        )}
                      </div>

                      <div
                        className="flex items-center gap-2 text-lg sm:text-xl flex-1"
                        style={fontMono}
                      >
                        <span style={{ color: "#1F2A44" }}>
                          {q.a} × {q.b} =
                        </span>
                        <input
                          type="number"
                          value={inputs[i]}
                          disabled={locked[i]}
                          onChange={(e) => handleInputChange(i, e.target.value)}
                          className="w-16 text-center rounded-lg py-1 outline-none transition-colors"
                          style={{
                            border: `2px solid ${
                              isWrong ? "#D14343" : isCorrect ? "#3F8F5F" : "#B8CFE0"
                            }`,
                            background: locked[i] ? "#EAF4EC" : "#FFFFFF",
                            color: "#1F2A44",
                          }}
                        />
                        {isCorrect && <Check size={18} color="#3F8F5F" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <button
                onClick={handleCheck}
                disabled={!canCheck}
                className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-opacity"
                style={{
                  ...fontDisplay,
                  background: "#1F2A44",
                  color: "#FBF8F2",
                  opacity: canCheck ? 1 : 0.4,
                  cursor: canCheck ? "pointer" : "not-allowed",
                }}
              >
                Check Answers
              </button>

              <button
                onClick={handleCorrection}
                disabled={!canCorrect}
                className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-opacity flex items-center gap-2"
                style={{
                  ...fontDisplay,
                  background: "#D14343",
                  color: "#FBF8F2",
                  opacity: canCorrect ? 1 : 0.4,
                  cursor: canCorrect ? "pointer" : "not-allowed",
                }}
              >
                <RotateCcw size={16} />
                Correction
              </button>

              <button
                onClick={handleNext}
                disabled={!canNext}
                className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-opacity flex items-center gap-2"
                style={{
                  ...fontDisplay,
                  background: "#3F8F5F",
                  color: "#FBF8F2",
                  opacity: canNext ? 1 : 0.4,
                  cursor: canNext ? "pointer" : "not-allowed",
                }}
              >
                {setIndex === TOTAL_SETS - 1 ? "Finish" : "Next Set"}
                <ArrowRight size={16} />
              </button>
            </div>

            {phase === "checked" && wrongCount > 0 && (
              <p
                className="text-center text-sm mt-3"
                style={{ ...fontMono, color: "#D14343" }}
              >
                {wrongCount} question{wrongCount > 1 ? "s" : ""} circled — tap Correction to fix
                {wrongCount > 1 ? " them" : " it"}.
              </p>
            )}
          </>
        ) : (
          <div
            className="rounded-2xl p-8 shadow-md text-center"
            style={{ background: "#FBF8F2", border: "1px solid #D8DEE8" }}
          >
            <Trophy size={40} color="#F4B942" className="mx-auto mb-3" />
            <div
              className="text-3xl font-extrabold mb-1"
              style={{ ...fontDisplay, color: "#1F2A44" }}
            >
              Test Complete!
            </div>
            <div className="text-lg mb-6" style={{ ...fontMono, color: "#5B6B85" }}>
              Final score: {totalSoFar} / {TOTAL_SETS * QUESTIONS_PER_SET}
            </div>
            <div className="flex justify-center gap-3 flex-wrap mb-6">
              {setScores.map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl px-4 py-2"
                  style={{ background: "#EFEAE0" }}
                >
                  <div
                    className="text-[10px] uppercase tracking-widest"
                    style={{ ...fontMono, color: "#5B6B85" }}
                  >
                    Set {i + 1}
                  </div>
                  <div
                    className="text-xl font-bold"
                    style={{ ...fontDisplay, color: "#1F2A44" }}
                  >
                    {s}/{QUESTIONS_PER_SET}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm"
              style={{ ...fontDisplay, background: "#1F2A44", color: "#FBF8F2" }}
            >
              Restart Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
