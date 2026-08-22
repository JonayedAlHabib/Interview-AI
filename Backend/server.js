require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/db")
const { checkAIConnection } = require("./src/services/ai.service")

connectToDB()

// Check AI Service Connection
checkAIConnection()

app.listen(3000, () => {
    console.log("✅ Server is running on port 3000")
    console.log("📍 Visit: http://localhost:3000")
})