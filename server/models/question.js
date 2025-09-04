import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true, unique: true }, 
    answers: [
      {
        optionNumber: { type: Number },
        optionCount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
