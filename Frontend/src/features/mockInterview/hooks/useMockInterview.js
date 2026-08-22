import { startMockInterview, submitAnswer, endMockInterviewSession, getMockInterviewSessionById, getAllMockInterviewSessions } from "../services/mockInterview.api"
import { useContext, useEffect } from "react"
import { MockInterviewContext } from "../mockInterview.context"
import { useParams } from "react-router"


export const useMockInterview = () => {

    const context = useContext(MockInterviewContext)
    const { sessionId } = useParams()

    if (!context) {
        throw new Error("useMockInterview must be used within a MockInterviewProvider")
    }

    const { loading, setLoading, session, setSession, sessions, setSessions } = context

    const startSession = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await startMockInterview({ interviewReportId })
            setSession(response.session)
            return response.session
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || error.message || "Failed to start mock interview session. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const submitCurrentAnswer = async ({ sessionId, answer }) => {
        setLoading(true)
        try {
            const response = await submitAnswer({ sessionId, answer })
            setSession(response.session)
            return response.session
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || error.message || "Failed to submit answer. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const endSession = async (sessionId) => {
        setLoading(true)
        try {
            const response = await endMockInterviewSession(sessionId)
            setSession(response.session)
            return response.session
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || error.message || "Failed to end mock interview session. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const getSessionById = async (sessionId) => {
        setLoading(true)
        try {
            const response = await getMockInterviewSessionById(sessionId)
            setSession(response.session)
            return response.session
        } catch (error) {
            console.error(error)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getSessions = async () => {
        setLoading(true)
        try {
            const response = await getAllMockInterviewSessions()
            setSessions(response.sessions)
            return response.sessions
        } catch (error) {
            console.error(error)
            return []
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (sessionId) {
            getSessionById(sessionId)
        }
    }, [ sessionId ])

    return { loading, session, sessions, startSession, submitCurrentAnswer, endSession, getSessionById, getSessions }

}
