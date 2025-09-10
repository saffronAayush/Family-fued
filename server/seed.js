// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Question from "./models/question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

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

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Question.deleteMany({});
    console.log("🧹 Cleared old questions");

    await Question.insertMany(questions);
    console.log("🎉 Questions seeded successfully!");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
};

seed();
