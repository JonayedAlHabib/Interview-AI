const mongoose = require("mongoose")


async function connectToDB() {

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message)
    })

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected")
    })

    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log("Connected to Database")
    }
    catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message)
        process.exit(1)
    }
}

module.exports = connectToDB
