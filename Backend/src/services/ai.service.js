const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

/**
 * @description Convert a Zod schema into a JSON schema Gemini's responseSchema accepts.
 * Uses Zod v4's built-in toJSONSchema (the old `zod-to-json-schema` package reads Zod v3's
 * internal schema shape and silently returns an empty schema on Zod v4, which is why the AI
 * response used to come back with empty arrays / missing fields).
 * Gemini's schema format doesn't understand "$schema" or "additionalProperties", so we strip them.
 */
function toGeminiSchema(zodSchema) {
    const schema = z.toJSONSchema(zodSchema)

    function clean(node) {
        if (Array.isArray(node)) {
            node.forEach(clean)
        } else if (node && typeof node === "object") {
            delete node.$schema
            delete node.additionalProperties
            Object.values(node).forEach(clean)
        }
    }

    clean(schema)
    return schema
}

/**
 * @description Test AI service connection
 */
async function checkAIConnection() {
    try {
        const testPrompt = "Say 'AI Service Connected' in one sentence"
        
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: testPrompt,
        })
        
        if (response.text) {
            console.log("✅ AI Service Connected: Google Gemini API is working")
            return true
        }
    } catch (error) {
        console.error("❌ AI Service Failed:", error.message)
        return false
    }
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toGeminiSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toGeminiSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

const mockInterviewTurnSchema = z.object({
    evaluation: z.object({
        score: z.number().describe("A score between 0 and 100 for how well the candidate answered the last question"),
        feedback: z.string().describe("2-3 sentence critique of the candidate's answer, covering strengths and gaps")
    }).nullable().describe("Evaluation of the candidate's most recent answer. Must be null only when there is no prior answer to evaluate, i.e. this is the first question of the session."),
    nextQuestion: z.object({
        question: z.string().describe("The next interview question to ask the candidate"),
        type: z.enum([ "technical", "behavioral" ]).describe("Whether this is a technical or behavioral question")
    }).describe("The next question to ask the candidate, adaptive to the conversation so far")
})

/**
 * @description Generate the next turn of a mock interview: evaluates the candidate's latest answer
 * (if any) and produces the next adaptive question, based on the job/candidate context and the
 * conversation history so far.
 */
async function generateMockInterviewTurn({ jobDescription, resume, selfDescription, history }) {

    const transcript = history.length
        ? history.map((turn, i) => `Q${ i + 1 } (${ turn.type }): ${ turn.question }\nCandidate's Answer: ${ turn.answer }`).join("\n\n")
        : "No questions have been asked yet. This is the first question of the session."

    const prompt = `You are conducting a live mock interview for a candidate with the following details:
                        Resume: ${ resume }
                        Self Description: ${ selfDescription }
                        Job Description: ${ jobDescription }

                        Conversation so far:
                        ${ transcript }

                        If the conversation so far contains at least one candidate answer, evaluate the candidate's most recent answer (the last one in the transcript) and set "evaluation" accordingly.
                        If no answer has been given yet, set "evaluation" to null.
                        Then generate the next interview question ("nextQuestion"), adaptive to what has already been asked and answered, mixing technical and behavioral questions relevant to the job description.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toGeminiSchema(mockInterviewTurnSchema),
        }
    })

    return JSON.parse(response.text)
}


const mockInterviewSummarySchema = z.object({
    overallScore: z.number().describe("An overall score between 0 and 100 for the candidate's performance across the whole mock interview session"),
    summary: z.string().describe("An overall performance summary covering strengths, weaknesses, and a recommendation for further preparation")
})

/**
 * @description Generate an overall performance summary for a completed mock interview session
 * based on the full question/answer/evaluation transcript.
 */
async function generateMockInterviewSummary({ jobDescription, history }) {

    const transcript = history.map((turn, i) => `Q${ i + 1 } (${ turn.type }): ${ turn.question }\nCandidate's Answer: ${ turn.answer }\nScore: ${ turn.score }\nFeedback: ${ turn.feedback }`).join("\n\n")

    const prompt = `You are reviewing a completed mock interview for a candidate applying to the following job:
                        Job Description: ${ jobDescription }

                        Full transcript with per-question scores and feedback:
                        ${ transcript }

                        Generate an overall performance summary for the candidate, covering their strengths, weaknesses, and a recommendation for what to focus on next in their preparation. Also provide an overall score between 0 and 100 for the whole session.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toGeminiSchema(mockInterviewSummarySchema),
        }
    })

    return JSON.parse(response.text)
}


module.exports = { generateInterviewReport, generateResumePdf, checkAIConnection, generateMockInterviewTurn, generateMockInterviewSummary }