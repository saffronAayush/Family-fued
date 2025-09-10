import React, { useState, useEffect } from "react";
import axios from "axios";
import { server, gameData } from "../constant";
import { X, CheckCircle2, Users, ArrowRight } from "lucide-react";
import { io } from "socket.io-client";

const AdminDashboard = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0-based index for gameData array
  const [questionData, setQuestionData] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [showCross, setShowCross] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [topAnswers, setTopAnswers] = useState([]);
  const [gameState, setGameState] = useState({
    isOpen: false,
    questionNumber: 1,
  });
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [socketInstance, setSocketInstance] = useState(null);
  const [liveUsers, setLiveUsers] = useState(0);

  // 🔹 Calculate top 4 answers by count
  const calculateTopAnswers = (answers) => {
    return [...answers] // Create a copy to avoid mutating the original array
      .sort((a, b) => (b.optionCount || 0) - (a.optionCount || 0))
      .slice(0, 4);
  };

  // 🔹 Load question from backend and merge with gameData (same as AdminStats)
  const loadQuestion = async (qIndex) => {
    try {
      // Get statistics from backend
      const res = await axios.get(
        `${server}/api/getquestiondetails/${qIndex + 1}`
      );
      if (res.data?.success) {
        const backendData = res.data.question;
        const questionIndex = qIndex; // Convert 1-based to 0-based index

        // Use gameData for question text and answer options, backend for statistics
        if (gameData[questionIndex]) {
          const question = gameData[questionIndex];
          const answers = question.answers.map((answer, index) => {
            // Find the corresponding backend answer by option number
            const backendAnswer = backendData.answers?.find(
              (ba) => ba.optionNumber === index + 1
            );
            return {
              optionNumber: index + 1,
              text: answer, // Use gameData for answer text
              optionCount: backendAnswer?.optionCount || 0, // Use backend for counts
            };
          });

          setQuestionData({
            questionNumber: qIndex + 1,
            question: question.question, // Use gameData for question text
            answers: answers,
          });
          setTopAnswers(calculateTopAnswers(answers));
          setTotalParticipants(res.data.totalParticipants || 0);
        }
      }
    } catch (err) {
      console.error("Error loading question data:", err);
      // Fallback to gameData only if backend fails
      if (gameData[qIndex]) {
        const question = gameData[qIndex];
        const answers = question.answers.map((answer, index) => ({
          optionNumber: index + 1,
          text: answer,
          optionCount: 0,
        }));
        setQuestionData({
          questionNumber: qIndex + 1,
          question: question.question,
          answers: answers,
        });
        setTopAnswers(calculateTopAnswers(answers));
      }
    }
  };

  useEffect(() => {
    if (token) {
      loadQuestion(currentQuestionIndex);
      setRevealedAnswers([]);
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
        if (
          st.questionNumber &&
          st.questionNumber !== currentQuestionIndex + 1
        ) {
          setCurrentQuestionIndex(st.questionNumber - 1);
        }
      }
    });
    s.on("newQuestion", (payload) => {
      if (payload?.questionNumber) {
        setCurrentQuestionIndex(payload.questionNumber - 1);
      }
    });
    s.on("optionIncremented", (payload) => {
      if (!payload) return;
      if (
        payload.questionNumber === currentQuestionIndex + 1 &&
        payload.question
      ) {
        const backendData = payload.question;
        const questionIndex = currentQuestionIndex;

        // Merge backend statistics with gameData display
        if (gameData[questionIndex]) {
          const question = gameData[questionIndex];
          const answers = question.answers.map((answer, index) => {
            // Find the corresponding backend answer by option number
            const backendAnswer = backendData.answers?.find(
              (ba) => ba.optionNumber === index + 1
            );
            return {
              optionNumber: index + 1,
              text: answer, // Use gameData for answer text
              optionCount: backendAnswer?.optionCount || 0, // Use backend for counts
            };
          });
          setQuestionData({
            questionNumber: currentQuestionIndex + 1,
            question: question.question, // Use gameData for question text
            answers: answers,
          });
          setTopAnswers(calculateTopAnswers(answers));
        }
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
        if (idx >= 0)
          next.answers[idx].optionCount =
            (next.answers[idx].optionCount || 0) + 1;
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

  // 🔹 Keyboard shortcuts (1-4 = reveal top answers by count order, space = ❌ wrong)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!token || !questionData || !topAnswers.length) return;

      const key = event.key;

      // Keys 1-4 reveal top 4 answers by count order (1=highest, 4=4th highest)
      if (key >= "1" && key <= "4") {
        const rankIndex = parseInt(key) - 1;
        const topAnswer = topAnswers[rankIndex];
        if (topAnswer) {
          // Find the original answer in questionData
          const originalAnswer = questionData.answers.find(
            (a) => a.optionNumber === topAnswer.optionNumber
          );
          if (
            originalAnswer &&
            !revealedAnswers.some(
              (ra) => ra.optionNumber === originalAnswer.optionNumber
            )
          ) {
            setRevealedAnswers((prev) => [...prev, originalAnswer]);
          }
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
  }, [token, questionData, revealedAnswers, topAnswers]);

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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < gameData.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setRevealedAnswers([]);
    } else {
      setIsGameComplete(true);
    }
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
        {/* Current Question */}
        <div className="bg-blue-900/15 rounded-2xl p-8 mb-8 backdrop-blur-md border border-blue-400/20 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Question {questionData.questionNumber}
            </h2>
            <p className="text-blue-100 text-2xl leading-relaxed">
              {questionData.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questionData.answers.map((ans) => {
              const isRevealed = revealedAnswers.some(
                (ra) => ra.optionNumber === ans.optionNumber
              );
              return (
                <div
                  key={ans.optionNumber}
                  className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden ${
                    isRevealed
                      ? "bg-green-900/30 border-green-500 text-green-100"
                      : "bg-blue-950/30 border-blue-700 text-blue-200 hover:bg-blue-900/30"
                  }`}
                >
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-blue-600/80 border border-blue-300/40 text-white text-lg font-bold flex items-center justify-center shadow-md">
                    {ans.optionNumber}
                  </div>
                  <div className="flex justify-between items-center pl-8">
                    <span className="font-semibold text-lg">
                      {ans.text || `Option ${ans.optionNumber}`}
                    </span>
                    {isRevealed && (
                      <div className="text-green-400 font-bold text-xl">
                        {ans.optionCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Question Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex >= gameData.length - 1}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500/90 hover:to-purple-500/90 disabled:from-gray-600/50 disabled:to-gray-700/50 disabled:cursor-not-allowed rounded-2xl text-white font-bold text-lg shadow-2xl border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              <ArrowRight
                size={24}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
              {currentQuestionIndex >= gameData.length - 1
                ? "Game Complete"
                : "Next Question"}
            </button>
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
