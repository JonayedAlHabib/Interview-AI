import React, { useState } from 'react'
import '../style/mockInterview.scss'
import { useMockInterview } from '../hooks/useMockInterview'
import { useNavigate, useParams } from 'react-router'

const MAX_TURNS = 6

const scoreClass = (score) => score >= 80 ? 'score--high' : score >= 60 ? 'score--mid' : 'score--low'

const MockInterview = () => {
    const { session, loading, submitCurrentAnswer, endSession } = useMockInterview()
    const { sessionId } = useParams()
    const navigate = useNavigate()

    const [ answer, setAnswer ] = useState("")
    const [ errorMessage, setErrorMessage ] = useState("")

    if (loading || !session) {
        return (
            <main className='loading-screen'>
                <h1>Loading your mock interview...</h1>
            </main>
        )
    }

    const answeredTurns = session.turns.filter(t => t.answer)
    const currentTurn = session.turns[ session.turns.length - 1 ]
    const hasPendingQuestion = currentTurn && !currentTurn.answer
    const atCap = session.turns.length >= MAX_TURNS && !hasPendingQuestion

    const handleSubmitAnswer = async () => {
        setErrorMessage("")
        if (!answer.trim()) {
            setErrorMessage("Please write an answer before submitting.")
            return
        }
        try {
            await submitCurrentAnswer({ sessionId, answer })
            setAnswer("")
        } catch (error) {
            setErrorMessage(error.message || "Something went wrong while submitting your answer. Please try again.")
        }
    }

    const handleEndSession = async () => {
        setErrorMessage("")
        try {
            await endSession(sessionId)
        } catch (error) {
            setErrorMessage(error.message || "Something went wrong while ending the session. Please try again.")
        }
    }

    return (
        <div className='mock-interview-page'>
            <div className='mock-interview-header'>
                <h1>Mock Interview</h1>
                <button className='button secondary-button' onClick={() => navigate(-1)}>Back</button>
            </div>

            <div className='mock-interview-layout'>
                {session.status === 'completed' ? (
                    <div className='mock-interview-summary'>
                        <p className='mock-interview-summary__score'>{session.overallScore}%</p>
                        <p className='mock-interview-summary__text'>{session.summary}</p>
                    </div>
                ) : null}

                {answeredTurns.length > 0 && (
                    <div className='turn-list'>
                        {answeredTurns.map((turn, i) => (
                            <div key={i} className='turn-card'>
                                <div className='turn-card__question-row'>
                                    <span className='turn-card__type'>{turn.type}</span>
                                    <p className='turn-card__question'>{turn.question}</p>
                                </div>
                                <p className='turn-card__answer'>{turn.answer}</p>
                                <div className='turn-card__feedback'>
                                    <span className={`turn-card__score ${scoreClass(turn.score)}`}>{turn.score}%</span>
                                    <p className='turn-card__feedback-text'>{turn.feedback}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasPendingQuestion && (
                    <div className='turn-card'>
                        <div className='turn-card__question-row'>
                            <span className='turn-card__type'>{currentTurn.type}</span>
                            <p className='turn-card__question'>{currentTurn.question}</p>
                        </div>
                        <div className='answer-box'>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder='Type your answer here...'
                            />
                        </div>
                    </div>
                )}

                {atCap && (
                    <p className='mock-interview-cap-note'>You've reached the {MAX_TURNS}-question limit for this session. End the session to get your overall performance summary.</p>
                )}

                {errorMessage && <span className='footer-error' style={{ color: '#e5484d', fontWeight: 500 }}>{errorMessage}</span>}

                {session.status !== 'completed' && (
                    <div className='mock-interview-actions'>
                        <button className='button secondary-button' onClick={handleEndSession} disabled={answeredTurns.length === 0}>
                            End Session
                        </button>
                        {hasPendingQuestion && (
                            <button className='button primary-button' onClick={handleSubmitAnswer}>
                                Submit Answer
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MockInterview
