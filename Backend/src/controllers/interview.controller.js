const pdfParse = require("pdf-parse")
const mammoth = require("mammoth")
const { generateInterviewReport, generateResumePdf, generateCoverLetterPdf, AIServiceUnavailableError } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const userModel = require("../models/user.model")

const ALLOWED_ROADMAP_DAYS = [ 7, 15, 30 ]

/**
 * @description Sanitize a user's full name into a filesystem/URL-safe lowercase token for filenames.
 */
function sanitizeNameForFilename(fullName) {
    return (fullName || "").toLowerCase().replace(/[^a-z0-9]+/g, "")
}

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
 * @description Extract text from PDF or DOCX file
 */
async function extractTextFromFile(file) {
    const mimeType = file.mimetype.toLowerCase()
    
    if (mimeType === "application/pdf") {
        // Handle PDF
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(file.buffer))).getText()
        return resumeContent.text
    } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword"
    ) {
        // Handle DOCX and DOC
        const result = await mammoth.extractRawText({ buffer: file.buffer })
        return result.value
    } else {
        throw new Error("Unsupported file type. Please upload PDF or DOCX file.")
    }
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        let resumeText = ""
        
        if (req.file) {
            resumeText = await extractTextFromFile(req.file)
        }
        
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if (!resumeText && !selfDescription) {
            return res.status(400).json({
                message: "Please provide either a resume or self description"
            })
        }

        const roadmapDays = ALLOWED_ROADMAP_DAYS.includes(Number(req.body.roadmapDays)) ? Number(req.body.roadmapDays) : 15

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription,
            roadmapDays
        })

        // Ensure title field exists from AI response
        if (!interViewReportByAi.title) {
            interViewReportByAi.title = "Interview Preparation Report"
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            roadmapDays,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Interview Report Error:", error.message)
        respondWithAIError(res, error, "Failed to generate interview report")
    }

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        const user = await userModel.findById(req.user.id)
        const sanitizedName = sanitizeNameForFilename(user.fullName)

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${sanitizedName || "resume"}_cv.pdf`
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error("Resume PDF Error:", error.message)
        respondWithAIError(res, error, "Failed to generate resume PDF")
    }
}

/**
 * @description Controller to generate cover letter PDF based on user self description, resume and job description.
 */
async function generateCoverLetterPdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateCoverLetterPdf({ resume, jobDescription, selfDescription })

        const user = await userModel.findById(req.user.id)
        const sanitizedName = sanitizeNameForFilename(user.fullName)

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${sanitizedName || "cover_letter"}_cover_letter.pdf`
        })

        res.send(pdfBuffer)
    } catch (error) {
        console.error("Cover Letter PDF Error:", error.message)
        respondWithAIError(res, error, "Failed to generate cover letter PDF")
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, generateCoverLetterPdfController }