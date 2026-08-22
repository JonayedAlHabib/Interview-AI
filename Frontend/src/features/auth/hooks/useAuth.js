import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || error.message || "Failed to log in. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ fullName, username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ fullName, username, email, password })
            setUser(data.user)
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || error.message || "Failed to register. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
        } catch (error) {
            console.error(error)
        } finally {
            setUser(null)
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}