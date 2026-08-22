import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, generateCoverLetterPdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { AuthContext } from "../../auth/auth.context"
import { useParams } from "react-router"

const sanitizeNameForFilename = (name) => (name || "").toLowerCase().replace(/[^a-z0-9]+/g, "")

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { user } = useContext(AuthContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile, roadmapDays }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile, roadmapDays })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || error.message || "Failed to generate interview report. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error(error)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error(error)
            return []
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const sanitizedName = sanitizeNameForFilename(user?.fullName)
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `${sanitizedName || "resume"}_cv.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getCoverLetterPdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateCoverLetterPdf({ interviewReportId })
            const sanitizedName = sanitizeNameForFilename(user?.fullName)
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `${sanitizedName || "cover_letter"}_cover_letter.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, getCoverLetterPdf }

}