import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})


/**
 * @description Service to start a new mock interview session based on an existing interview report.
 */
export const startMockInterview = async ({ interviewReportId }) => {
    const response = await api.post("/api/mock-interview/start", { interviewReportId })

    return response.data
}


/**
 * @description Service to submit an answer to the current question of a mock interview session.
 */
export const submitAnswer = async ({ sessionId, answer }) => {
    const response = await api.post(`/api/mock-interview/${ sessionId }/answer`, { answer })

    return response.data
}


/**
 * @description Service to end a mock interview session and get its overall summary.
 */
export const endMockInterviewSession = async (sessionId) => {
    const response = await api.post(`/api/mock-interview/${ sessionId }/end`)

    return response.data
}


/**
 * @description Service to get a mock interview session by id.
 */
export const getMockInterviewSessionById = async (sessionId) => {
    const response = await api.get(`/api/mock-interview/${ sessionId }`)

    return response.data
}


/**
 * @description Service to get all mock interview sessions of the logged in user.
 */
export const getAllMockInterviewSessions = async () => {
    const response = await api.get("/api/mock-interview/")

    return response.data
}
