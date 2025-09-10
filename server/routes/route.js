import express from "express"
import { adminLogin, emitQuestion, getQuestionOptions, incrementOptionCount, login } from "../controlers/controls.js";
import { getGameState, startGame, resetGame } from "../controlers/controls.js";
const app = express.Router()
app.post("/login",login)
app.post("/submit",incrementOptionCount)
app.post("/admin-login",adminLogin)
app.get("/getquestiondetails/:id" ,getQuestionOptions )
app.post("/emitNext" ,emitQuestion)
// game state controls
app.get("/state", getGameState)
app.post("/start", startGame)
app.post("/reset", resetGame)
export default app