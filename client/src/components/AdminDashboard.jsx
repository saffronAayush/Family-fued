import React, { useState, useEffect } from "react";
import { Lock, UnlockKeyhole, ArrowRight, X, CheckCircle2 } from "lucide-react";

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

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if password matches the required admin password
    if (password === "admin1005") {
      localStorage.setItem("adminToken", "true");
      setToken("true");
      setError("");
    } else {
      setError("Invalid admin password. Please try again.");
      setPassword("");
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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setPassword("");
    setError("");
    setCurrentQuestionIndex(0);
    setRevealedAnswers([]);
    setIsGameComplete(false);
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md p-8 bg-blue-900/20 rounded-xl shadow-xl backdrop-blur-sm border border-blue-400/20"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-blue-200/80 text-sm">
              Enter admin password to access the dashboard
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full p-3 bg-blue-950/40 border border-blue-400/30 rounded-lg text-white placeholder:text-blue-300/50 focus:border-blue-400/50 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full p-3 bg-gradient-to-r from-blue-600/80 to-blue-900/80 hover:from-blue-500/80 hover:to-blue-800/80 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20"
            >
              Access Dashboard
            </button>
          </div>
        </form>
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
                <div
                  key={answer}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isRevealed
                      ? "bg-green-900/30 border-green-500 text-green-100"
                      : "bg-blue-950/30 border-blue-700 text-blue-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{answer}</span>
                    {isRevealed && (
                      <div className="text-green-400 font-bold">
                        {revealedAnswer.count}/28
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Complete Screen */}
        {isGameComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-blue-900/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-400/20 bg-opacity-30 max-w-md w-full text-center">
              <div className="mb-6">
                <CheckCircle2 className="mx-auto text-green-400" size={80} />
              </div>
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
              <button
                onClick={() => {
                  setIsGameComplete(false);
                  setCurrentQuestionIndex(0);
                  setRevealedAnswers([]);
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600/80 to-blue-900/80 rounded-lg text-lg font-bold shadow-lg transition-opacity border border-blue-400/20 hover:from-blue-500/80 hover:to-blue-800/80 text-white"
              >
                Start New Game
              </button>
            </div>
          </div>
        )}

        {/* Cross Animation Overlay */}
        {showCross && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <X className="text-red-500" size={200} strokeWidth={4} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
