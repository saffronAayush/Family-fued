import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Send, CheckCircle2, ArrowRight } from "lucide-react";
import GlitchText from "./components/GlitchText";
// --- Game Data ---
const gameData = [
  {
    question: "What’s the most common breakup reason in college?",
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
    question: "What’s the most common breakup reason in college?",
    topAnswers: [
      { answer: "Cheating 💔", count: 26 },
      { answer: "Exams 📚", count: 21 },
      { answer: "Long distance 🛣️", count: 18 },
      { answer: "Too clingy 😬", count: 14 },
    ], // total = 79 (others got 9)
  },
  {
    question: "What do students actually mean by 'group study'?",
    topAnswers: [
      { answer: "Gossip 🗣️", count: 24 },
      { answer: "Snacks 🍔", count: 22 },
      { answer: "Sleep 💤", count: 20 },
      { answer: "Netflix 🍿", count: 15 },
    ], // total = 81 (others got 7)
  },
  {
    question: "Name a place on campus where couples are always spotted.",
    topAnswers: [
      { answer: "Garden 🌹", count: 28 },
      { answer: "Canteen 🍵", count: 21 },
      { answer: "Library 📚", count: 19 },
      { answer: "Rooftop 🌌", count: 12 },
    ], // total = 80 (others got 8)
  },
];

// --- Animation Variants ---
const cardVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.95 },
};

const FamilyFeudGame = () => {
  const [step, setStep] = useState("username"); // 'username', 'playing', 'submitted', 'thankyou'
  const [username, setUsername] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check localStorage on component mount
  useEffect(() => {
    const gameCompleted = localStorage.getItem("familyFeudCompleted");
    if (gameCompleted === "true") {
      setStep("thankyou");
      setIsCompleted(true);
    }
  }, []);

  const handleStartGame = (e) => {
    e.preventDefault();
    if (username.trim()) setStep("playing");
  };

  const handleSelectAnswer = (answerText) => {
    setSelectedAnswers([answerText]); // Only store the most recent selection
  };

  const handleSubmitAnswers = () => {
    if (selectedAnswers.length === 1) {
      // Store the answer for current question
      const newAnswer = {
        questionIndex: currentQuestion,
        question: gameData[currentQuestion].question,
        answer: selectedAnswers[0],
      };

      const updatedAnswers = [...allAnswers, newAnswer];
      setAllAnswers(updatedAnswers);

      console.log({
        user: username,
        selection: selectedAnswers[0],
        question: currentQuestion + 1,
      });

      // Check if this was the last question
      if (currentQuestion === gameData.length - 1) {
        // Game completed
        localStorage.setItem("familyFeudCompleted", "true");
        localStorage.setItem(
          "familyFeudAnswers",
          JSON.stringify(updatedAnswers)
        );
        localStorage.setItem("familyFeudUsername", username);
        setIsCompleted(true);
        setStep("thankyou");
      } else {
        // Move to next question
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswers([]);
      }
    }
  };

  const hasSelection = selectedAnswers.length === 1;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans text-white">
      <AnimatePresence mode="wait">
        {step === "username" && (
          <motion.form
            key="username"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onSubmit={handleStartGame}
            className="w-full max-w-md mx-auto bg-blue-950/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-400/20 bg-opacity-30"
          >
            <div className="flex flex-col items-center justify-center mb-8">
              <GlitchText
                speed={1}
                enableShadows={true}
                enableOnHover={false}
                className="text-center text-5xl font-bold mb-4"
              >
                Family Feud
              </GlitchText>
              <p className="text-center text-white/80">
                Enter your name to start.
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
                className="w-full p-3 pl-10 bg-blue-950/20 border-2 border-transparent focus:border-blue-400/50 focus:outline-none rounded-lg placeholder:text-blue-200/50 text-lg transition-colors text-blue-100"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!username.trim()}
              className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600/80 to-blue-900/80 rounded-lg text-lg font-bold shadow-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/20 hover:from-blue-500/80 hover:to-blue-800/80"
            >
              Start Game
            </motion.button>
          </motion.form>
        )}

        {step === "playing" && (
          <motion.div
            key="playing"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-md mx-auto bg-blue-950/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-400/20 bg-opacity-30"
          >
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

            <h2 className="text-2xl font-bold text-center mb-4">
              {gameData[currentQuestion]?.question}
            </h2>

            {/* Progress Bar */}
            {selectedAnswers.length > 0 && (
              <p className="text-center text-sm font-semibold text-blue-300 mb-6">
                Your answer: {selectedAnswers[0]}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {gameData[currentQuestion]?.answers.map((answer) => {
                const isSelected = selectedAnswers.includes(answer);
                return (
                  <motion.button
                    key={answer}
                    onClick={() => handleSelectAnswer(answer)}
                    animate={{
                      scale: isSelected ? 1.05 : 1,
                      backgroundColor: isSelected
                        ? "rgba(59, 130, 246, 0.4)"
                        : "rgba(23, 37, 84, 0.4)",
                      color: isSelected ? "#E0F2FE" : "#93C5FD",
                    }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: isSelected
                        ? "rgba(59, 130, 246, 0.5)"
                        : "rgba(23, 37, 84, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 rounded-lg text-center font-semibold shadow-md backdrop-blur-sm border border-white/10"
                  >
                    {answer}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitAnswers}
              disabled={!hasSelection}
              className="w-full mt-8 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600/60 to-blue-900/60 backdrop-blur-sm rounded-lg text-lg font-bold shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-blue-400/20 hover:from-blue-500/60 hover:to-blue-800/60 text-blue-100"
            >
              {currentQuestion === gameData.length - 1 ? (
                <>
                  <CheckCircle2 size={20} /> Complete Game
                </>
              ) : (
                <>
                  <ArrowRight size={20} /> Next Question
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {step === "thankyou" && (
          <motion.div
            key="thankyou"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center w-full max-w-md mx-auto bg-blue-950/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-blue-400/20 bg-opacity-30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <CheckCircle2 className="mx-auto text-green-400" size={80} />
            </motion.div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyFeudGame;
