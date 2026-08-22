import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [ fullName, setFullName ] = useState("")
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const {loading,handleRegister} = useAuth()
    const [ errorMessage, setErrorMessage ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage("")
        try {
            await handleRegister({fullName,username,email,password})
            navigate("/dashboard")
        } catch (error) {
            setErrorMessage(error.message || "Failed to register. Please try again.")
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
                    <h1>Create your account</h1>
                    <p>Start preparing for your next interview</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            onChange={(e) => { setFullName(e.target.value) }}
                            type="text" id="fullName" name='fullName' placeholder='Enter your full name' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' />
                    </div>
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
                    <button className='button auth-submit-btn'>Create Account</button>

                </form>

                <p className='auth-switch'>Already have an account? <Link to={"/login"} >Login</Link></p>
            </div>
        </main>
    )
}

export default Register
