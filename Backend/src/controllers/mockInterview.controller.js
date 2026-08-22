const { generateMockInterviewTurn, generateMockInterviewSummary, AIServiceUnavailableError } = require("../services/ai.service")
const mockInterviewSessionModel = require("../models/mockInterviewSession.model")
const interviewReportModel = require("../models/interviewReport.model")

const MAX_TURNS = 6

/**
 * @description Respond with 503 for a temporary AI capacity outage, otherwise 400 with the error message.
 */
function respondWithAIError(res, error, fallbackMessage) {
    if (error instanceof AIServiceUnavailableError) {
        return res.status(503).json({ message: error.message })
    }
    res.status(400).json({ message: error.message || fallbackMessage })
}

/**
 * @description Controller to start a new mock interview session based on an existing interview report.
 */
async function startMockInterviewController(req, res) {
    try {
        const { interviewReportId } = req.body

        if (!interviewReportId) {
            return res.status(400).json({
                message: "interviewReportId is required"
            })
        }

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { jobDescription, resume, selfDescription } = interviewReport

        const { nextQuestion } = await generateMockInterviewTurn({
            jobDescription, resume, selfDescription, history: []
        })

        const session = await mockInterviewSessionModel.create({
            user: req.user.id,
            interviewReport: interviewReport._id,
            jobDescription,
            resume,
            selfDescription,
            turns: [ { question: nextQuestion.question, type: nextQuestion.type } ]
        })

        res.status(201).json({
            message: "Mock interview session started successfully.",
            session
        })
    } catch (error) {
        console.error("Start Mock Interview Error:", error.message)
        respondWithAIError(res, error, "Failed to start mock interview session")
    }
}

/**
 * @description Controller to submit an answer to the current question of a mock interview session,
 * get its evaluation, and receive the next question (unless the turn cap has been reached).
 */
async function submitAnswerController(req, res) {
    try {
        const { sessionId } = req.params
        const { answer } = req.body

        if (!answer) {
            return res.status(400).json({
                message: "Answer is required"
            })
        }

        const session = await mockInterviewSessionModel.findOne({ _id: sessionId, user: req.user.id })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview session not found."
            })
        }

        if (session.status === "completed") {
            return res.status(400).json({
                message: "This mock interview session has already ended."
            })
        }

        const currentTurn = session.turns[ session.turns.length - 1 ]

        if (!currentTurn || currentTurn.answer) {
            return res.status(400).json({
                message: "There is no pending question to answer."
            })
        }

        currentTurn.answer = answer

        const { jobDescription, resume, selfDescription } = session

        const { evaluation, nextQuestion } = await generateMockInterviewTurn({
            jobDescription, resume, selfDescription, history: session.turns
        })

        currentTurn.score = evaluation.score
        currentTurn.feedback = evaluation.feedback

        if (session.turns.length < MAX_TURNS) {
            session.turns.push({ question: nextQuestion.question, type: nextQuestion.type })
        }

        await session.save()

        res.status(200).json({
            message: "Answer submitted successfully.",
            session
        })
    } catch (error) {
        console.error("Submit Mock Interview Answer Error:", error.message)
        respondWithAIError(res, error, "Failed to submit answer")
    }
}

/**
 * @description Controller to end a mock interview session and generate an overall performance summary.
 */
async function endSessionController(req, res) {
    try {
        const { sessionId } = req.params

        const session = await mockInterviewSessionModel.findOne({ _id: sessionId, user: req.user.id })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview session not found."
            })
        }

        if (session.status === "completed") {
            return res.status(200).json({
                message: "Mock interview session already ended.",
                session
            })
        }

        // Drop a trailing unanswered question, if any.
        if (session.turns.length && !session.turns[ session.turns.length - 1 ].answer) {
            session.turns.pop()
        }

        const { overallScore, summary } = await generateMockInterviewSummary({
            jobDescription: session.jobDescription,
            history: session.turns
        })

        session.status = "completed"
        session.overallScore = overallScore
        session.summary = summary

        await session.save()

        res.status(200).json({
            message: "Mock interview session ended successfully.",
            session
        })
    } catch (error) {
        console.error("End Mock Interview Session Error:", error.message)
        respondWithAIError(res, error, "Failed to end mock interview session")
    }
}

/**
 * @description Controller to fetch a single mock interview session by id.
 */
async function getSessionController(req, res) {
    try {
        const { sessionId } = req.params

        const session = await mockInterviewSessionModel.findOne({ _id: sessionId, user: req.user.id })

        if (!session) {
            return res.status(404).json({
                message: "Mock interview session not found."
            })
        }

        res.status(200).json({
            message: "Mock interview session fetched successfully.",
            session
        })
    } catch (error) {
        console.error("Get Mock Interview Session Error:", error.message)
        res.status(400).json({
            message: error.message || "Failed to fetch mock interview session"
        })
    }
}

/**
 * @description Controller to fetch all mock interview sessions for the logged in user.
 */
async function getAllSessionsController(req, res) {
    try {
        const sessions = await mockInterviewSessionModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-turns -resume -selfDescription -jobDescription -__v")

        res.status(200).json({
            message: "Mock interview sessions fetched successfully.",
            sessions
        })
    } catch (error) {
        console.error("Get All Mock Interview Sessions Error:", error.message)
        res.status(400).json({
            message: error.message || "Failed to fetch mock interview sessions"
        })
    }
}

module.exports = {
    startMockInterviewController,
    submitAnswerController,
    endSessionController,
    getSessionController,
    getAllSessionsController
}
