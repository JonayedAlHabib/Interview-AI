const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const mockInterviewController = require("../controllers/mockInterview.controller")

const mockInterviewRouter = express.Router()


/**
 * @route POST /api/mock-interview/start
 * @description start a new mock interview session based on an existing interview report.
 * @access private
 */
mockInterviewRouter.post("/start", authMiddleware.authUser, mockInterviewController.startMockInterviewController)


/**
 * @route POST /api/mock-interview/:sessionId/answer
 * @description submit an answer to the current question of a mock interview session.
 * @access private
 */
mockInterviewRouter.post("/:sessionId/answer", authMiddleware.authUser, mockInterviewController.submitAnswerController)


/**
 * @route POST /api/mock-interview/:sessionId/end
 * @description end a mock interview session and generate an overall performance summary.
 * @access private
 */
mockInterviewRouter.post("/:sessionId/end", authMiddleware.authUser, mockInterviewController.endSessionController)


/**
 * @route GET /api/mock-interview/:sessionId
 * @description get a mock interview session by id.
 * @access private
 */
mockInterviewRouter.get("/:sessionId", authMiddleware.authUser, mockInterviewController.getSessionController)


/**
 * @route GET /api/mock-interview/
 * @description get all mock interview sessions of logged in user.
 * @access private
 */
mockInterviewRouter.get("/", authMiddleware.authUser, mockInterviewController.getAllSessionsController)


module.exports = mockInterviewRouter
