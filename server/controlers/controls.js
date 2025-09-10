import Participant from "../models/participant.js";
import Question from "../models/question.js";
import { getIo } from "../socket.js";

// In-memory game state controlled by admin
let gameState = {
  isOpen: false,
  questionNumber: 1,
};

// Player login
const login = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  try {
    const participant = new Participant({ name });
    await participant.save();
    return res.status(201).json({ success: true, participant });
  } catch (err) {
    console.error("Error saving participant:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  const { password } = req.body;
  if (!password || password.trim() === "") {
    return res.status(400).json({ success: false, message: "Password is required" });
  }
  try {
    if (password === "admin108834") {
  return res.status(200).json({ success: true, message: "Admin login successful" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    console.error("Error in admin login:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get question with options + counts
const getQuestionOptions = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid question number" });
  }
  try {
    const question = await Question.findOne({ questionNumber: parseInt(id) });
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const totalParticipants = await Participant.countDocuments();
    return res.status(200).json({ success: true, question, totalParticipants });
  } catch (err) {
    console.error("Error fetching question:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Increment count for selected option
const incrementOptionCount = async (req, res) => {
  console.log("🔥 incrementOptionCount called with:", req.body);
  const { questionNumber, optionNumber } = req.body;
  if (!questionNumber || !optionNumber) {
    return res.status(400).json({
      success: false,
      message: "questionNumber and optionNumber are required",
    });
  }
  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      { questionNumber, "answers.optionNumber": optionNumber },
      { $inc: { "answers.$.optionCount": 1 } },
      { new: true }
    ).select("questionNumber question answers");
    if (!updatedQuestion) {
      return res.status(404).json({ success: false, message: "Question or option not found" });
    }
    // Emit live update to all clients (especially admin)
    const totalParticipants = await Participant.countDocuments();
    getIo().emit("optionIncremented", {
      questionNumber,
      optionNumber,
      question: updatedQuestion,
      totalParticipants,
    });
    return res.status(200).json({ success: true, message: "Option count incremented", question: updatedQuestion });
  } catch (err) {
    console.error("Error updating option count:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Emit next question to all clients
const emitQuestion = async (req, res) => {
  const { questionNumber } = req.body;
  if (!questionNumber) {
    return res.status(400).json({ success: false, message: "questionNumber is required" });
  }
  try {
    // Update in-memory state and broadcast
    if (!gameState.isOpen) {
      gameState.isOpen = true; // auto-open game if admin advances
    }
    gameState.questionNumber = Number(questionNumber);
    getIo().emit("newQuestion", { questionNumber: gameState.questionNumber });
    getIo().emit("gameState", { ...gameState });
    return res.status(200).json({ success: true, message: "Question number emitted successfully", questionNumber: gameState.questionNumber });
  } catch (err) {
    console.error("Error emitting question:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get current game state
const getGameState = async (req, res) => {
  try {
    return res.status(200).json({ success: true, state: gameState });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Start game (admin)
const startGame = async (req, res) => {
  try {
    const { questionNumber } = req.body || {};
    gameState.isOpen = true;
    gameState.questionNumber = Number(questionNumber) || 1;
    getIo().emit("gameState", { ...gameState });
    // Also push current question so clients can load it immediately
    getIo().emit("newQuestion", { questionNumber: gameState.questionNumber });
    return res.status(200).json({ success: true, state: gameState });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Reset/Stop game
const resetGame = async (req, res) => {
  try {
    gameState = { isOpen: false, questionNumber: 1 };
    getIo().emit("gameState", { ...gameState });
    return res.status(200).json({ success: true, state: gameState });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export { getGameState, startGame, resetGame };

// Seeder to reset DB with text answers
/*const fun = async () => {
  await Question.deleteMany({});
  console.log("🧹 Existing questions removed");

  const questions = [
    {
      questionNumber: 1,
      question: "What's the most common breakup reason in college?",
      answers: [
        { optionNumber: 1, text: "Exams 📚", optionCount: 0 },
        { optionNumber: 2, text: "Long distance 🛣️", optionCount: 0 },
        { optionNumber: 3, text: "Found someone new 👀", optionCount: 0 },
        { optionNumber: 4, text: "Family pressure 👵", optionCount: 0 },
        { optionNumber: 5, text: "Caught by warden 🚨", optionCount: 0 },
        { optionNumber: 6, text: "Money 💸", optionCount: 0 },
        { optionNumber: 7, text: "Cheating 💔", optionCount: 0 },
        { optionNumber: 8, text: "No time ⏰", optionCount: 0 },
        { optionNumber: 9, text: "Too clingy 😬", optionCount: 0 },
        { optionNumber: 10, text: "Boring 😴", optionCount: 0 },
      ],
    },
    {
      questionNumber: 2,
      question: "What do students actually mean by 'group study'?",
      answers: [
        { optionNumber: 1, text: "Netflix 🍿", optionCount: 0 },
        { optionNumber: 2, text: "Cards 🎲", optionCount: 0 },
        { optionNumber: 3, text: "Snacks 🍔", optionCount: 0 },
        { optionNumber: 4, text: "Gossip 🗣️", optionCount: 0 },
        { optionNumber: 5, text: "Sleep 💤", optionCount: 0 },
        { optionNumber: 6, text: "Music 🎶", optionCount: 0 },
        { optionNumber: 7, text: "Movies 🎬", optionCount: 0 },
        { optionNumber: 8, text: "Romance 😉", optionCount: 0 },
        { optionNumber: 9, text: "Memes 😂", optionCount: 0 },
        { optionNumber: 10, text: "Private tuitions 😏", optionCount: 0 },
      ],
    },
    {
    questionNumber: 3,
    question: "Name a place on campus where couples are always spotted.",
    answers: [
      { optionNumber: 1, text: "Canteen 🍵", optionCount: 0 },
      { optionNumber: 2, text: "Garden 🌹", optionCount: 0 },
      { optionNumber: 3, text: "Library 📚", optionCount: 0 },
      { optionNumber: 4, text: "Rooftop 🌌", optionCount: 0 },
      { optionNumber: 5, text: "Parking 🛵", optionCount: 0 },
      { optionNumber: 6, text: "Stairs 🪜", optionCount: 0 },
      { optionNumber: 7, text: "Empty class 🏫", optionCount: 0 },
      { optionNumber: 8, text: "Hostel room 🛏️", optionCount: 0 },
      { optionNumber: 9, text: "Cafe ☕", optionCount: 0 },
      { optionNumber: 10, text: "Corridor 🚶", optionCount: 0 },
    ],
  },
  ];


  await Question.insertMany(questions);
  console.log("🎉 Questions seeded successfully!");
  process.exit();
};
*/
export { login, adminLogin, getQuestionOptions, incrementOptionCount, emitQuestion};