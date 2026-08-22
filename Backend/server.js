require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/db")
const { checkAIConnection } = require("./src/services/ai.service")

const REQUIRED_ENV_VARS = [ "JWT_SECRET", "MONGO_URI", "GOOGLE_GENAI_API_KEY" ]
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[ key ])

if (missingEnvVars.length) {
    console.error(`❌ Missing required environment variable(s): ${missingEnvVars.join(", ")}`)
    process.exit(1)
}

connectToDB()

// Check AI Service Connection
checkAIConnection()

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`)
    console.log(`📍 Visit: http://localhost:${PORT}`)
})

async function shutdown(signal) {
    console.log(`${signal} received, shutting down gracefully...`)
    server.close(async () => {
        await require("mongoose").connection.close()
        process.exit(0)
    })
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
