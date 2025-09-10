import React, { useState, useEffect } from "react";
import { server } from "./constant";
import { io } from "socket.io-client";
import { User, CheckCircle2, ArrowRight } from "lucide-react";

// --- Game Data ---
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

const FamilyFeudGame = () => {
  const [step, setStep] = useState("username"); // 'username', 'playing', 'thankyou'
  const [username, setUsername] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Connect to socket and subscribe to game state
  useEffect(() => {
    const socket = io(server, { transports: ["websocket"], withCredentials: true });

    socket.on("connect", () => {
      // Identify as a participant so server can track live users
      socket.emit("register", { role: "participant" });
      // console.log("connected", socket.id);
    });

    socket.on("gameState", (state) => {
      if (state) {
        setIsOpen(!!state.isOpen);
        const q = Number(state.questionNumber || 1);
        setCurrentQuestion(Math.max(0, q - 1));
        // If admin reset/closed game, allow users to play again
        if (!state.isOpen) {
          localStorage.removeItem("familyFeudCompleted");
          // Keep username so they don't have to retype if they stay on page
          setIsCompleted(false);
          setSelectedAnswers([]);
          setSubmitted(false);
          setStep("username");
        }
      }
    });

    socket.on("newQuestion", (payload) => {
      if (payload?.questionNumber) {
  setIsOpen(true);
        const qNum = Number(payload.questionNumber);
        // If admin moved beyond last question -> complete
        if (qNum > gameData.length) {
          localStorage.setItem("familyFeudCompleted", "true");
          if (username) {
            localStorage.setItem("familyFeudUsername", username);
          }
          setIsCompleted(true);
          setStep("thankyou");
          return;
        }
        setCurrentQuestion(Math.max(0, qNum - 1));
        setSelectedAnswers([]);
        setSubmitted(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    // On mount fetch current state once as well
    fetch(`${server}/api/state`).then((r) => r.json()).then((d) => {
      if (d?.success && d.state) {
        setIsOpen(!!d.state.isOpen);
        setCurrentQuestion(Math.max(0, Number(d.state.questionNumber || 1) - 1));
        if (!d.state.isOpen) {
          localStorage.removeItem("familyFeudCompleted");
          setIsCompleted(false);
          setSelectedAnswers([]);
          setSubmitted(false);
          setStep("username");
        }
      }
    }).catch(() => {
      // If state endpoint not available, wait for socket event instead
      setTimeout(() => {}, 0);
    });

  return () => socket.close();
  }, []);

  // Check localStorage on mount (if already completed)
  useEffect(() => {
    const gameCompleted = localStorage.getItem("familyFeudCompleted");
    if (gameCompleted === "true") {
      setStep("thankyou");
      setIsCompleted(true);
    }
  }, []);

  const handleStartGame = (e) => {
    e.preventDefault();
  if (!username.trim()) return;
  if (!isOpen) return; // prevent starting before admin opens
  setStep("playing");
  window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectAnswer = (answerText) => {
    setSelectedAnswers([answerText]); // only one answer at a time
  };

  const handleSubmitAnswers = () => {
    if (selectedAnswers.length === 1) {
      if (submitted) return; // prevent duplicate posts
      const selectedAnswer = selectedAnswers[0];
      const questionNumber = currentQuestion + 1; // backend expects 1-based index
      const optionNumber =
        gameData[currentQuestion].answers.indexOf(selectedAnswer) + 1;

      // Send result to backend
  fetch(`${server}/api/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionNumber,
          optionNumber,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("✅ Answer saved to server:", data);
          setSubmitted(true);
        })
        .catch((err) => console.error("❌ Error saving result:", err));
    }
  };

  const hasSelection = selectedAnswers.length === 1;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-2 md:p-4 font-sans text-white">
      {/* --- Username Input Screen --- */}
  {step === "username" && (
        <form
          onSubmit={handleStartGame}
          className="w-full max-w-md mx-auto bg-blue-950/20 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-8 border border-blue-400/20"
        >
          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-center text-3xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              IOTA FEUD
            </h1>
            <p className="text-center text-white/80">
              Enter your name to join. {isOpen ? "" : "(Waiting for admin to start)"}
            </p>
          </div>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
              size={20}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 pl-10 bg-blue-950/20 border-2 border-transparent focus:border-blue-400/50 focus:outline-none rounded-lg placeholder:text-blue-200/50 text-lg text-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim() || !isOpen}
            className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600/80 to-blue-900/80 rounded-lg text-lg font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20 hover:from-blue-500/80 hover:to-blue-800/80"
          >
            {isOpen ? "Start Game" : "Waiting for Admin"}
          </button>
        </form>
      )}

      {/* --- Game Playing Screen --- */}
      {step === "playing" && (
        <div className="w-full max-w-md mx-auto bg-blue-950/20 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-8 border border-blue-400/20">
          <p className="text-center text-blue-200/90 text-sm">
            Hi, {username}!
          </p>

          {/* Progress indicator */}
          <div className="w-full bg-blue-900/20 rounded-full h-2 mb-4">
            <div
              className="bg-blue-400 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestion + 1) / gameData.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-center text-blue-300/80 text-sm mb-4">
            Question {currentQuestion + 1} of {gameData.length}
          </p>

          <h2 className="text-lg md:text-2xl font-bold text-center mb-4">
            {gameData[currentQuestion]?.question}
          </h2>

          {/* Selected Answer */}
          {selectedAnswers.length > 0 && (
            <p className="text-center text-sm font-semibold text-blue-300 mb-6">
              Your answer: {selectedAnswers[0]}
            </p>
          )}

          {/* Answer Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gameData[currentQuestion]?.answers.map((answer) => {
              const isSelected = selectedAnswers.includes(answer);
              return (
                <button
                  key={answer}
                  onClick={() => handleSelectAnswer(answer)}
                  className={`p-4 rounded-lg text-center font-semibold shadow-md backdrop-blur-sm border border-white/10 transition-all ${
                    isSelected
                      ? "bg-blue-500/40 text-blue-100 scale-105"
                      : "bg-blue-950/40 text-blue-200 hover:bg-blue-900/40 hover:scale-105"
                  }`}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmitAnswers}
            disabled={!hasSelection || submitted}
            className="w-full mt-8 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600/60 to-blue-900/60 backdrop-blur-sm rounded-lg text-lg font-bold shadow-lg transition disabled:opacity-30 disabled:cursor-not-allowed border border-blue-400/20 hover:from-blue-500/60 hover:to-blue-800/60 text-blue-100"
          >
            {submitted ? (
              <>Submitted ✓ (waiting for next question)</>
            ) : (
              <>
                <CheckCircle2 size={20} /> Submit Answer
              </>
            )}
          </button>
        </div>
      )}

      {/* --- Thank You Screen --- */}
      {step === "thankyou" && (
        <div className="text-center w-full max-w-md mx-auto bg-blue-950/20 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-8 border border-blue-400/20">
          <div className="mb-6">
            <CheckCircle2 className="mx-auto text-green-400" size={80} />
          </div>
          <h2 className="text-3xl font-bold mt-4 mb-2">Thank You!</h2>
          <p className="text-blue-200/90 mb-4">
            Thanks for completing all questions,{" "}
            {isCompleted
              ? localStorage.getItem("familyFeudUsername") || "Player"
              : username}
            !
          </p>
          <p className="text-white/80 text-sm">
            Your responses have been recorded successfully.
          </p>
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg">
            <p className="text-blue-300/80 text-sm">
              🎉 Game completed! You can now close this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyFeudGame;
