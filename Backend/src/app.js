const express = require('express')
const cookieParser = require("cookie-parser")
const cors = require("cors")


const app = express()

// Required for req.secure / the "X-Forwarded-Proto" header to be trusted correctly
// when running behind a reverse proxy (every PaaS host does this) — the secure cookie
// flag in auth.controller.js depends on this being set.
app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173").split(","),
    credentials: true
}))

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const mockInterviewRouter = require("./routes/mockInterview.routes")


app.use("/api/auth", authRouter)
app.use("/api/interview",interviewRouter)
app.use("/api/mock-interview", mockInterviewRouter)

module.exports = app