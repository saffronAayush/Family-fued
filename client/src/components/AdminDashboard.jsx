import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  Lock,
  UnlockKeyhole,
  ArrowRight,
  X,
} from "lucide-react";
import { server } from "../constant";

// Game data imported from FamilyFeud
const gameData = [
  {
    question: "What's the most common breakup reason in college?",
    answers: [
      "Exams 📚",
      "Long distance 🛣️",
      "Found someone new 👀",
      "Family pressure 👵",
      "Caught by warden 🚨",
      "Money 💸",
      "Cheating 💔",
      "No time ⏰",
      "Too clingy 😬",
      "Boring 😴",
    ],
  },
  {
    question: "What do students actually mean by 'group study'?",
    answers: [
      "Netflix 🍿",
      "Cards 🎲",
      "Snacks 🍔",
      "Gossip 🗣️",
      "Sleep 💤",
      "Music 🎶",
      "Movies 🎬",
      "Romance 😉",
      "Memes 😂",
      "Private tuitions 😏",
    ],
  },
  {
    question: "Name a place on campus where couples are always spotted.",
    answers: [
      "Canteen 🍵",
      "Garden 🌹",
      "Library 📚",
      "Rooftop 🌌",
      "Parking 🛵",
      "Stairs 🪜",
      "Empty class 🏫",
      "Hostel room 🛏️",
      "Cafe ☕",
      "Corridor 🚶",
    ],
  },
];

const gameResults = [
  {
    question: "What's the most common breakup reason in college?",
    topAnswers: [
      { answer: "Cheating 💔", count: 26 },
      { answer: "Exams 📚", count: 21 },
      { answer: "Long distance 🛣️", count: 18 },
      { answer: "Too clingy 😬", count: 14 },
    ],
  },
  {
    question: "What do students actually mean by 'group study'?",
    topAnswers: [
      { answer: "Gossip 🗣️", count: 24 },
      { answer: "Snacks 🍔", count: 22 },
      { answer: "Sleep 💤", count: 20 },
      { answer: "Netflix 🍿", count: 15 },
    ],
  },
  {
    question: "Name a place on campus where couples are always spotted.",
    topAnswers: [
      { answer: "Garden 🌹", count: 28 },
      { answer: "Canteen 🍵", count: 21 },
      { answer: "Library 📚", count: 19 },
      { answer: "Rooftop 🌌", count: 12 },
    ],
  },
];

const AdminDashboard = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [showCross, setShowCross] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!token) return;

      const key = event.key;

      // Handle number keys 1-4
      if (key >= "1" && key <= "4") {
        const answerIndex = parseInt(key) - 1;
        const currentQuestionData = gameResults[currentQuestionIndex];

        if (
          currentQuestionData &&
          currentQuestionData.topAnswers[answerIndex]
        ) {
          const answer = currentQuestionData.topAnswers[answerIndex];
          if (!revealedAnswers.some((ra) => ra.answer === answer.answer)) {
            setRevealedAnswers((prev) => [...prev, answer]);
          }
        }
      }

      // Handle spacebar for wrong answer
      if (key === " ") {
        event.preventDefault();
        setShowCross(true);
        setTimeout(() => setShowCross(false), 1000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [token, currentQuestionIndex, revealedAnswers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("handleLogin");
      console.log(password);
      console.log(`${server}/admin-login`);
      const response = await fetch(`${server}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Invalid credentials");

      const data = await response.json();
      localStorage.setItem("adminToken", true);
      setToken(true);
    } catch (err) {
      alert("Invalid admin password");
    }
  };

  const handleAdvanceQuestion = () => {
    if (currentQuestionIndex < gameData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setRevealedAnswers([]);
    } else {
      // Game is complete after the third question
      setIsGameComplete(true);
    }
  };

  const handleToggleLock = async () => {
    try {
      await fetch("http://localhost:3000/api/admin/lock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locked: !isLocked }),
      });
    } catch (err) {
      setError("Failed to toggle lock");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
        <motion.form
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onSubmit={handleLogin}
          className="w-full max-w-md p-8 bg-blue-900/20 rounded-xl shadow-xl backdrop-blur-sm"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Admin Login
          </h2>
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin Password"
            className="w-full p-3 bg-blue-950/40 border border-blue-400/30 rounded-lg mb-4 text-white"
          />
          <button
            onClick={handleLogin}
            className="w-full p-3 bg-black hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
          >
            Login
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleToggleLock}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                isLocked
                  ? "bg-red-500/80 hover:bg-red-600/80 text-white"
                  : "bg-green-500/80 hover:bg-green-600/80 text-white"
              }`}
            >
              {isLocked ? <Lock size={20} /> : <UnlockKeyhole size={20} />}
              {isLocked ? "Unlock Question" : "Lock Question"}
            </button>
            <button
              onClick={handleAdvanceQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded-lg text-white font-semibold transition-colors"
            >
              {currentQuestionIndex === gameData.length - 1 ? (
                <>
                  <CheckCircle2 size={20} />
                  Complete Game
                </>
              ) : (
                <>
                  <ArrowRight size={20} />
                  Next Question
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-blue-900/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-white">
              Question {currentQuestionIndex + 1} of {gameData.length}
            </h2>
            <div className="text-blue-300 text-sm">
              Press 1-4 to reveal answers, Space for wrong answer
            </div>
          </div>
          <p className="text-blue-100 text-lg mb-6">
            {gameData[currentQuestionIndex]?.question}
          </p>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameData[currentQuestionIndex]?.answers.map((answer, index) => {
              const revealedAnswer = revealedAnswers.find(
                (ra) => ra.answer === answer
              );
              const isRevealed = !!revealedAnswer;

              return (
                <motion.div
                  key={answer}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isRevealed
                      ? "bg-green-900/30 border-green-500 text-green-100"
                      : "bg-blue-950/30 border-blue-700 text-blue-200"
                  }`}
                  animate={{
                    scale: isRevealed ? 1.02 : 1,
                    backgroundColor: isRevealed
                      ? "rgba(34, 197, 94, 0.3)"
                      : "rgba(30, 58, 138, 0.3)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{answer}</span>
                    {isRevealed && (
                      <div className="text-green-400 font-bold">
                        {revealedAnswer.count}/88
                      </div>
                    )}
                  </div>
                  {isRevealed && (
                    <div className="text-green-300 text-sm mt-1">
                      {(() => {
                        // Find the actual position in the gameResults topAnswers array
                        const currentQuestionData =
                          gameResults[currentQuestionIndex];
                        const actualRank =
                          currentQuestionData.topAnswers.findIndex(
                            (ra) => ra.answer === revealedAnswer.answer
                          ) + 1;
                        const suffixes = ["st", "nd", "rd", "th"];
                        const suffix =
                          actualRank <= 3 ? suffixes[actualRank - 1] : "th";

                        // Points based on ranking
                        const points = [500, 300, 150, 50][actualRank - 1] || 0;

                        return (
                          <div>
                            <div>
                              {actualRank}${suffix} Place
                            </div>
                            <div className="text-yellow-400 font-bold">
                              {points} points
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Revealed Answers Statistics */}
        {revealedAnswers.length > 0 && (
          <div className="bg-blue-900/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6">
              Revealed Answers
            </h2>
            <div className="grid gap-4">
              {revealedAnswers
                .sort((a, b) => b.count - a.count)
                .map((answer) => {
                  // Find the actual position in the gameResults topAnswers array
                  const currentQuestionData = gameResults[currentQuestionIndex];
                  const actualRank =
                    currentQuestionData.topAnswers.findIndex(
                      (ra) => ra.answer === answer.answer
                    ) + 1;

                  return (
                    <div
                      key={answer.answer}
                      className="flex items-center gap-4"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {actualRank}
                      </div>
                      <div className="flex-1 text-blue-100 min-w-0">
                        {answer.answer}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-green-400 font-bold">
                          {answer.count}/88
                        </div>
                        <div className="text-green-300 text-sm">
                          {(() => {
                            const suffixes = ["st", "nd", "rd", "th"];
                            const suffix =
                              actualRank <= 3 ? suffixes[actualRank - 1] : "th";

                            // Points based on ranking
                            const points =
                              [500, 300, 150, 50][actualRank - 1] || 0;

                            return (
                              <div>
                                <div>
                                  {actualRank}${suffix} Place
                                </div>
                                <div className="text-yellow-400 font-bold">
                                  {points} points
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Game Complete Screen */}
        {isGameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-900/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-400/20 bg-opacity-30 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.4,
                }}
                className="mb-6"
              >
                <CheckCircle2 className="mx-auto text-green-400" size={80} />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Game Complete!
              </h2>
              <p className="text-blue-200/90 mb-6">
                All questions have been completed. The Family Feud game is now
                finished.
              </p>
              <div className="space-y-2 text-blue-300">
                <p>🎉 Thank you for hosting the game!</p>
                <p>📊 All answers have been revealed</p>
                <p>🏆 Game session completed successfully</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsGameComplete(false);
                  setCurrentQuestionIndex(0);
                  setRevealedAnswers([]);
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600/80 to-blue-900/80 rounded-lg text-lg font-bold shadow-lg transition-opacity border border-blue-400/20 hover:from-blue-500/80 hover:to-blue-800/80 text-white"
              >
                Start New Game
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Cross Animation Overlay */}
        <AnimatePresence>
          {showCross && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <X className="text-red-500" size={200} strokeWidth={4} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
