import Participant from "../models/participant.js";
import Question from "../models/question.js";
import { getIo } from "../socket.js";
const login = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
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
const adminLogin = async (req, res) => {
  console.log("adminLogin");
  const { password } = req.body;

  if (!password || password.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Password is required" });
  }

  try {
    if (password === "admin108834") {
      return res
        .status(200)
        .json({ success: true, message: "Admin login successful" });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    console.error("Error in admin login:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const getQuestionOptions = async (req, res) => {
  const { id } = req.params;

  // Validate if id is a number
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid question number" });
  }

  try {
    // Find question by its questionNumber
    const question = await Question.findOne({ questionNumber: parseInt(id) });

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Count all participants
    const totalParticipants = await Participant.countDocuments();

    return res.status(200).json({
      success: true,
      question,
      totalParticipants,
    });
  } catch (err) {
    console.error("Error fetching question:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const incrementOptionCount = async (req, res) => {
  const { questionNumber, optionNumber } = req.body;

  // Basic validation
  if (!questionNumber || !optionNumber) {
    return res
      .status(400)
      .json({
        success: false,
        message: "questionNumber and optionNumber are required",
      });
  }

  try {
    // Find the question and increment the count of the matching option
    const updatedQuestion = await Question.findOneAndUpdate(
      { questionNumber, "answers.optionNumber": optionNumber },
      { $inc: { "answers.$.optionCount": 1 } }, // $ targets the matching option
      { new: true } // return updated document
    ).select("questionNumber answers");

    if (!updatedQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question or option not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Option count incremented",
      question: updatedQuestion,
    });
  } catch (err) {
    console.error("Error updating option count:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const emitQuestion = async (req, res) => {
  const { questionNumber } = req.body;

  if (!questionNumber) {
    return res
      .status(400)
      .json({ success: false, message: "questionNumber is required" });
  }

  try {
    // ✅ Emit event to all connected clients
    getIo().emit("newQuestion", { questionNumber });

    return res.status(200).json({
      success: true,
      message: "Question number emitted successfully",
      questionNumber,
    });
  } catch (err) {
    console.error("Error emitting question:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// rough function
const fun = async () => {
  await Question.deleteMany({});
  console.log("🧹 Existing questions removed");

  // Create 3 questions
  const questions = [];
  for (let q = 1; q <= 5; q++) {
    const answers = [];
    for (let i = 1; i <= 10; i++) {
      answers.push({ optionNumber: i, optionCount: 0 });
    }
    questions.push({ questionNumber: q, answers });
  }

  await Question.insertMany(questions);
  console.log("🎉 3 questions inserted successfully!");
  const q = await Question.find({});
  q.forEach((e) => {
    console.log(e);
  });
  process.exit(); // Exit after seeding
};
export {
  login,
  adminLogin,
  getQuestionOptions,
  incrementOptionCount,
  emitQuestion,
  fun,
};
