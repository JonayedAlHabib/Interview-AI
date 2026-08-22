import { createContext, useState } from "react";


export const MockInterviewContext = createContext()

export const MockInterviewProvider = ({ children }) => {
    const [ loading, setLoading ] = useState(false)
    const [ session, setSession ] = useState(null)
    const [ sessions, setSessions ] = useState([])

    return (
        <MockInterviewContext.Provider value={{ loading, setLoading, session, setSession, sessions, setSessions }}>
            {children}
        </MockInterviewContext.Provider>
    )
}
