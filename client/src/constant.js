// Server configuration
export const server = import.meta.env.VITE_SERVER || "http://localhost:3000";

export const gameResults = [
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
