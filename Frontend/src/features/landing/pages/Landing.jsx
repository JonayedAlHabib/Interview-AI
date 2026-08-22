import React from 'react'
import '../style/landing.scss'
import { Link } from 'react-router'

const SERVICES = [
    {
        title: 'AI Interview Reports',
        description: 'Paste a job description and get a resume-to-job match score, likely technical and behavioral questions with model answers, and a skill gap analysis.'
    },
    {
        title: 'Mock Interview Practice',
        description: 'Practice live with an AI interviewer that asks adaptive questions, scores every answer, and gives written feedback in real time.'
    },
    {
        title: 'Tailored Resume & Cover Letter',
        description: 'Download an ATS-friendly resume and a matching cover letter, both tailored to the specific job you are targeting.'
    },
    {
        title: 'Day-by-Day Roadmap',
        description: 'Choose a 7, 15, or 30-day preparation plan built around your actual skill gaps for the role.'
    }
]

const NAV_LINKS = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' }
]

const Landing = () => {
    return (
        <div className='landing-page'>
            <header className='landing-header'>
                <a href='#home' className='landing-header__logo'>Interview <span className='highlight'>AI</span></a>
                <nav className='landing-header__nav'>
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href} className='landing-header__link'>{link.label}</a>
                    ))}
                </nav>
                <div className='landing-header__actions'>
                    <Link to='/login' className='button secondary-button'>Login</Link>
                    <Link to='/register' className='button primary-button'>Get Started</Link>
                </div>
            </header>

            <section id='home' className='landing-hero'>
                <h1>Walk into your next interview <span className='highlight'>fully prepared</span></h1>
                <p>Interview AI turns a job description and your resume into a personalized interview strategy: likely questions, model answers, skill gaps, a preparation roadmap, and live mock interview practice.</p>
                <div className='landing-hero__actions'>
                    <Link to='/register' className='button primary-button'>Create Your Free Plan</Link>
                    <Link to='/login' className='button secondary-button'>I already have an account</Link>
                </div>
            </section>

            <section id='about' className='landing-about'>
                <h2>About Interview AI</h2>
                <p>Interview AI is a full-stack application built to help job seekers prepare for interviews. Upload your resume or write a quick self-description, paste in a target job description, and the AI (Google Gemini) generates a structured interview strategy report with skill-gap analysis and a day-by-day preparation roadmap. From there, you can practice with a live AI-driven mock interview and download a tailored, ATS-friendly resume and cover letter for that specific role.</p>
            </section>

            <section id='services' className='landing-services'>
                <h2>Services</h2>
                <div className='landing-services__grid'>
                    {SERVICES.map((service) => (
                        <div key={service.title} className='landing-feature-card'>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className='landing-footer'>
                <p>&copy; {new Date().getFullYear()} Interview AI. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Landing
