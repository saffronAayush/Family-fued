import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../constant";
import { ArrowRight, X, CheckCircle2, Users, Play, RefreshCcw } from "lucide-react";
import { io } from "socket.io-client";

const AdminDashboard = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1); // questionNumber starts at 1
  const [questionData, setQuestionData] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [showCross, setShowCross] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameState, setGameState] = useState({ isOpen: false, questionNumber: 1 });
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [socketInstance, setSocketInstance] = useState(null);
  const [liveUsers, setLiveUsers] = useState(0);

  // 🔹 Fetch question from backend
  useEffect(() => {
    if (token) {
      // Load current game state first
      axios.get(`${server}/api/state`).then((res) => {
        if (res.data?.success) {
          const s = res.data.state || {};
          setGameState(s);
          setCurrentQuestionIndex(s.questionNumber || 1);
          fetchQuestion(s.questionNumber || currentQuestionIndex);
        } else {
          fetchQuestion(currentQuestionIndex);
        }
      }).catch(() => fetchQuestion(currentQuestionIndex));
    }
  }, [token, currentQuestionIndex]);

  // Subscribe to realtime state
  useEffect(() => {
    if (!token) return;
    const s = io(server, { transports: ["websocket"], withCredentials: true });
    setSocketInstance(s);
    // Identify as admin; server excludes admin from live user count
    s.on("connect", () => {
      s.emit("register", { role: "admin" });
    });
    s.on("gameState", (st) => {
      if (st) {
        setGameState(st);
        if (st.questionNumber && st.questionNumber !== currentQuestionIndex) {
          setCurrentQuestionIndex(st.questionNumber);
          fetchQuestion(st.questionNumber);
        }
      }
    });
    s.on("newQuestion", (payload) => {
      if (payload?.questionNumber) {
        setCurrentQuestionIndex(payload.questionNumber);
        fetchQuestion(payload.questionNumber);
      }
    });
    s.on("optionIncremented", (payload) => {
      if (!payload) return;
      if (payload.question) {
        setQuestionData(payload.question);
        if (typeof payload.totalParticipants === "number") {
          setTotalParticipants(payload.totalParticipants);
        }
        return;
      }
      // Minimal update: increment count locally as fallback
      const opt = payload.optionNumber;
      setQuestionData((prev) => {
        if (!prev) return prev;
        const next = { ...prev, answers: prev.answers.map((a) => ({ ...a })) };
        const idx = next.answers.findIndex((a) => a.optionNumber === opt);
        if (idx >= 0) next.answers[idx].optionCount = (next.answers[idx].optionCount || 0) + 1;
        return next;
      });
    });
    s.on("liveUsers", (payload) => {
      if (payload && typeof payload.count === "number") {
        setLiveUsers(payload.count);
      }
    });
    return () => s.close();
  }, [token]);

  const fetchQuestion = async (qNum) => {
    try {
      const res = await axios.get(`${server}/api/getquestiondetails/${qNum}`);
      if (res.data.success) {
        setQuestionData(res.data.question);
        setRevealedAnswers([]);
        if (typeof res.data.totalParticipants === "number") {
          setTotalParticipants(res.data.totalParticipants);
        }
      }
    } catch (err) {
      console.error("Error fetching question:", err.message);
    }
  };

  // 🔹 Keyboard shortcuts (1-9 = reveal answers, space = ❌ wrong)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!token || !questionData) return;

      const key = event.key;

      if ((key >= "1" && key <= "9") || key === "0") {
        const index = key === "0" ? 9 : parseInt(key) - 1;
        const answer = questionData.answers[index];
        if (
          answer &&
          !revealedAnswers.some(
            (ra) => ra.optionNumber === answer.optionNumber
          )
        ) {
          setRevealedAnswers((prev) => [...prev, answer]);
        }
      }

      if (key === " ") {
        event.preventDefault();
        setShowCross(true);
        setTimeout(() => setShowCross(false), 1000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [token, questionData, revealedAnswers]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin108834") {
      localStorage.setItem("adminToken", "true");
      setToken("true");
      setError("");
    } else {
      setError("Invalid admin password. Please try again.");
      setPassword("");
    }
  };

  const handleAdvanceQuestion = async () => {
    try {
      // Emit to participants
  await axios.post(`${server}/api/emitNext`, {
        questionNumber: currentQuestionIndex + 1,
      });

      setCurrentQuestionIndex((prev) => prev + 1);
      setRevealedAnswers([]);

      // If no more questions, mark complete
      if (currentQuestionIndex >= 5) {
        setIsGameComplete(true);
      }
    } catch (err) {
      console.error("Error advancing question:", err.message);
    }
  };

  const handleStartGame = async () => {
    try {
      // Try the start endpoint first
      try {
        const res = await axios.post(`${server}/api/start`, {
          questionNumber: currentQuestionIndex,
        });
        if (res.data?.success) {
          setGameState(res.data.state);
          return;
        }
      } catch (err) {
        // Fallback: use emitNext (auto-opens game on server and broadcasts)
        await axios.post(`${server}/api/emitNext`, {
          questionNumber: currentQuestionIndex,
        });
        setGameState({ isOpen: true, questionNumber: currentQuestionIndex });
      }
    } catch (e) {
      console.error("Failed to start game", e.message);
    }
  };

  const handleResetGame = async () => {
    try {
      const res = await axios.post(`${server}/api/reset`);
      if (res.data?.success) {
        setGameState(res.data.state);
        setCurrentQuestionIndex(1);
        setRevealedAnswers([]);
        setIsGameComplete(false);
        fetchQuestion(1);
      }
    } catch (e) {
      console.error("Failed to reset game", e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setPassword("");
    setError("");
    setCurrentQuestionIndex(1);
    setRevealedAnswers([]);
    setIsGameComplete(false);
    setQuestionData(null);
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

  if (!questionData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        Loading question...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-purple-950 via-blue-950 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-2xl border border-blue-400/20 bg-blue-900/10 backdrop-blur-md p-4 md:p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-300/80 text-sm mt-1">Control the game, monitor answers, and advance questions in real time.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${gameState?.isOpen ? "bg-green-500/20 border-green-500/30 text-green-300" : "bg-red-500/20 border-red-500/30 text-red-300"}`}>
                  {gameState?.isOpen ? "Game Open" : "Game Closed"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  Q#{currentQuestionIndex}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 inline-flex items-center gap-1" title="Live users">
                  <Users size={14} /> {liveUsers}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleStartGame}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-700/80 rounded-lg text-white font-semibold border border-green-400/20"
              >
                <Play size={16} /> Open/Sync Game
              </button>
              <button
                onClick={handleResetGame}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/80 hover:bg-yellow-700/80 rounded-lg text-white font-semibold border border-yellow-400/20"
              >
                <RefreshCcw size={16} /> Reset
              </button>
              <button
                onClick={handleAdvanceQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 rounded-lg text-white font-semibold border border-blue-400/20"
              >
                <ArrowRight size={18} /> Next Question
              </button>
              <div className="ml-auto"></div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700/80 rounded-lg text-white font-semibold border border-red-400/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        

  {/* Current Question */}
  <div className="bg-blue-900/15 rounded-2xl p-6 mb-8 backdrop-blur-md border border-blue-400/20 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            Question {questionData.questionNumber}
          </h2>
          <p className="text-blue-100 text-lg mb-6">{questionData.question}</p>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionData.answers.map((ans) => {
              const isRevealed = revealedAnswers.some(
                (ra) => ra.optionNumber === ans.optionNumber
              );
              return (
                <div
                  key={ans.optionNumber}
                  className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden ${
                    isRevealed
                      ? "bg-green-900/30 border-green-500 text-green-100"
                      : "bg-blue-950/30 border-blue-700 text-blue-200 hover:bg-blue-900/30"
                  }`}
                >
                  <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-blue-600/80 border border-blue-300/40 text-white text-sm font-bold flex items-center justify-center shadow-md">
                    {ans.optionNumber}
                  </div>
                  <div className="flex justify-between items-center pl-6">
                    {/* 🔹 Fallback if text is missing */}
                    <span className="font-semibold">
                      {ans.text || `Option ${ans.optionNumber}`}
                    </span>
                    {isRevealed && (
                      <div className="text-green-400 font-bold">
                        {ans.optionCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Complete Screen */}
        {isGameComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-blue-900/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-400/20 bg-opacity-30 max-w-md w-full text-center">
              <CheckCircle2 className="mx-auto text-green-400 mb-4" size={80} />
              <h2 className="text-3xl font-bold text-white mb-4">
                Game Complete!
              </h2>
              <p className="text-blue-200/90 mb-6">
                All questions have been completed. 🎉
              </p>
              <button
                onClick={() => {
                  setIsGameComplete(false);
                  setCurrentQuestionIndex(1);
                  fetchQuestion(1);
                }}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600/80 to-blue-900/80 rounded-lg text-lg font-bold shadow-lg transition-opacity border border-blue-400/20 hover:from-blue-500/80 hover:to-blue-800/80 text-white"
              >
                Start New Game
              </button>
            </div>
          </div>
        )}

        {/* Wrong Answer ❌ overlay */}
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
