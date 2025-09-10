// Server configuration
// Prefer env var; fall back to localhost:8000 to match backend default
export const server = import.meta.env.VITE_SERVER || "http://localhost:8000";

export const gameResults = [
  {
    question: "What's the most common breakup reason in college?",
    topAnswers: [
      { answer: "Cheating 💔", count: 12 },
      { answer: "Exams 📚", count: 8 },
      { answer: "Long distance 🛣️", count: 5 },
      { answer: "Too clingy 😬", count: 3 },
    ], // total = 28
  },
  {
    question: "What do students actually mean by 'group study'?",
    topAnswers: [
      { answer: "Gossip 🗣️", count: 9 },
      { answer: "Snacks 🍔", count: 7 },
      { answer: "Sleep 💤", count: 4 },
      { answer: "Netflix 🍿", count: 2 },
    ], // total = 22
  },
  {
    question: "Name a place on campus where couples are always spotted.",
    topAnswers: [
      { answer: "Garden 🌹", count: 11 },
      { answer: "Canteen 🍵", count: 6 },
      { answer: "Library 📚", count: 4 },
      { answer: "Rooftop 🌌", count: 2 },
    ], // total = 23
  },
];
