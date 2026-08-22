import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ errorMessage, setErrorMessage ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage("")
        try {
            await handleLogin({email,password})
            navigate('/dashboard')
        } catch (error) {
            setErrorMessage(error.message || "Failed to log in. Please try again.")
        }
    }

    if(loading){
        return (<main className='auth-page'><h1>Loading.......</h1></main>)
    }

    return (
        <main className='auth-page'>
            <Link to={"/"} className='back-link'>&larr; Back to Home</Link>
            <div className="auth-card">
                <Link to={"/"} className='auth-logo'>Interview <span className='highlight'>AI</span></Link>
                <div className="auth-card__header">
                    <h1>Log in</h1>
                    <p>Proceed to your dashboard</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' />
                    </div>
                    {errorMessage && <p className='form-error'>{errorMessage}</p>}
                    <button className='button auth-submit-btn'>Log in</button>
                </form>
                <p className='auth-switch'>New to Interview AI? <Link to={"/register"} >Register</Link></p>
            </div>
        </main>
    )
}

export default Login
