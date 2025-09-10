import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  optionNumber: { type: Number, required: true },
  text: { type: String }, // ✅ Make sure text is defined
  optionCount: { type: Number, default: 0 },
});

const questionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true, unique: true },
    question: { type: String, required: true },
    answers: [answerSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
