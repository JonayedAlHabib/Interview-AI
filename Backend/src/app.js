const express = require('express')
const cookieParser = require("cookie-parser")
const cors = require("cors")


const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const mockInterviewRouter = require("./routes/mockInterview.routes")


app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)
app.use("/api/mock-interview", mockInterviewRouter)

module.exports = app