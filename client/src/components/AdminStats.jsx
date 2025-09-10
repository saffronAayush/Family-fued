import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { server, gameData } from "../constant";
import { io } from "socket.io-client";
import { Users, BarChart3, ArrowRight, Play, RefreshCcw } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminStats = () => {
  console.log("in admin stats");
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [questions, setQuestions] = useState([1, 2, 3]);
  const [selected, setSelected] = useState(1);
  const [data, setData] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [liveUsers, setLiveUsers] = useState(0);
  const [gameState, setGameState] = useState({
    isOpen: false,
    questionNumber: 1,
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);

  const load = async (q) => {
    try {
      // Get statistics from backend
      const res = await axios.get(`${server}/api/getquestiondetails/${q}`);
      if (res.data?.success) {
        const backendData = res.data.question;
        const questionIndex = q - 1; // Convert 1-based to 0-based index

        // Use gameData for question text and answer options, backend for statistics
        if (gameData[questionIndex]) {
          const question = gameData[questionIndex];
          setData({
            questionNumber: q,
            question: question.question, // Use gameData for question text
            answers: question.answers.map((answer, index) => ({
              optionNumber: index + 1,
              text: answer, // Use gameData for answer text
              optionCount: backendData.answers?.[index]?.optionCount || 0, // Use backend for counts
            })),
          });
          setTotalParticipants(res.data.totalParticipants || 0);
        }
      }
    } catch (err) {
      console.error("Error loading question data:", err);
      // Fallback to gameData only if backend fails
      const questionIndex = q - 1;
      if (gameData[questionIndex]) {
        const question = gameData[questionIndex];
        setData({
          questionNumber: q,
          question: question.question,
          answers: question.answers.map((answer, index) => ({
            optionNumber: index + 1,
            text: answer,
            optionCount: 0,
          })),
        });
      }
    }
  };

  const handleAdvanceQuestion = async () => {
    try {
      // Emit to participants
      await axios.post(`${server}/api/emitNext`, {
        questionNumber: currentQuestionIndex + 1,
      });

      setCurrentQuestionIndex((prev) => prev + 1);
      setSelected(currentQuestionIndex + 1);
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
        setSelected(1);
        load(1);
      }
    } catch (e) {
      console.error("Failed to reset game", e.message);
      // Fallback: reset locally
      setCurrentQuestionIndex(1);
      setSelected(1);
      load(1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  useEffect(() => {
    load(selected);
  }, [selected]);

  // Load game state on mount
  useEffect(() => {
    if (token) {
      axios
        .get(`${server}/api/state`)
        .then((res) => {
          if (res.data?.success) {
            const s = res.data.state || {};
            setGameState(s);
            setCurrentQuestionIndex(s.questionNumber || 1);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    const s = io(server, { transports: ["websocket"], withCredentials: true });
    s.on("connect", () => {
      // Identify as admin for socket role tracking
      s.emit("register", { role: "admin" });
    });
    s.on("gameState", (st) => {
      if (st) {
        setGameState(st);
        if (st.questionNumber && st.questionNumber !== currentQuestionIndex) {
          setCurrentQuestionIndex(st.questionNumber);
        }
      }
    });
    s.on("newQuestion", (payload) => {
      if (payload?.questionNumber) {
        setCurrentQuestionIndex(payload.questionNumber);
        setSelected(payload.questionNumber);
      }
    });
    s.on("optionIncremented", (payload) => {
      if (!payload) return;
      if (payload.questionNumber === selected && payload.question) {
        const backendData = payload.question;
        const questionIndex = selected - 1;

        // Merge backend statistics with gameData display
        if (gameData[questionIndex]) {
          const question = gameData[questionIndex];
          setData({
            questionNumber: selected,
            question: question.question, // Use gameData for question text
            answers: question.answers.map((answer, index) => ({
              optionNumber: index + 1,
              text: answer, // Use gameData for answer text
              optionCount: backendData.answers?.[index]?.optionCount || 0, // Use backend for counts
            })),
          });
        }
        if (typeof payload.totalParticipants === "number") {
          setTotalParticipants(payload.totalParticipants);
        }
      }
    });
    s.on("liveUsers", (payload) => {
      if (payload && typeof payload.count === "number") {
        setLiveUsers(payload.count);
      }
    });
    return () => s.close();
  }, [selected]);

  if (!token) {
    return <Navigate to={"/admin"} />;
  }
  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-purple-950 via-blue-950 to-black text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-blue-400/20 bg-blue-900/10 backdrop-blur-md p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/30">
                <BarChart3 className="text-blue-300" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Stats</h1>
                <p className="text-blue-300/80 text-sm">
                  Live submissions per option by question
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-blue-300/80">
                Select Question:
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                className="bg-blue-950/40 border border-blue-400/30 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400/50"
              >
                {questions.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                gameState?.isOpen
                  ? "bg-green-500/20 border-green-500/30 text-green-300"
                  : "bg-red-500/20 border-red-500/30 text-red-300"
              }`}
            >
              {gameState?.isOpen ? "Game Open" : "Game Closed"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300">
              Q#{selected}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300 inline-flex items-center gap-1">
              <Users size={14} /> {liveUsers}
            </span>
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

        {!data ? (
          <div className="text-center text-blue-200/80">Loading…</div>
        ) : (
          <div className="bg-blue-900/15 rounded-2xl p-6 backdrop-blur-md border border-blue-400/20 shadow-xl">
            {/* Question Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                Question {data.questionNumber}
              </h2>
              <p className="text-blue-100 text-2xl leading-relaxed">
                {data.question}
              </p>
            </div>

            {/* Stats Info */}
            <div className="text-center mb-6">
              <p className="text-sm text-blue-300/80">
                Total participants: {totalParticipants}
              </p>
            </div>

            {/* Stats Display */}
            <div className="space-y-3">
              {data.answers
                .sort((a, b) => (b.optionCount || 0) - (a.optionCount || 0))
                .slice(0, 4)
                .map((a) => {
                  return (
                    <div
                      key={a.optionNumber}
                      className="relative bg-blue-950/30 border-2 border-blue-700 rounded-xl p-4 hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-blue-600/80 border border-blue-300/40 text-white text-sm font-bold flex items-center justify-center shadow-md">
                        {a.optionNumber}
                      </div>
                      <div className="flex justify-between items-center text-lg pl-6">
                        <span className="font-medium text-blue-100">
                          {a.text}
                        </span>
                        <span className="font-bold text-blue-200 text-xl">
                          {a.optionCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
