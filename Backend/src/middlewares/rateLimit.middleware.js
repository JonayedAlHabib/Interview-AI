const rateLimit = require("express-rate-limit")

/**
 * @description Brute-force protection on login/register.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in 15 minutes." }
})

/**
 * @description Caps requests to the AI-generating endpoints, which cost real money per call.
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many AI requests. Please try again in an hour." }
})

module.exports = { authLimiter, aiLimiter }
