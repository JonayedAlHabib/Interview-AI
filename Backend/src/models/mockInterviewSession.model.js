const mongoose = require('mongoose');


const turnSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [ true, "Question is required" ]
    },
    type: {
        type: String,
        enum: [ "technical", "behavioral" ],
        required: [ true, "Question type is required" ]
    },
    answer: {
        type: String,
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
    },
    feedback: {
        type: String,
    }
}, {
    _id: false
})

const mockInterviewSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },
    jobDescription: {
        type: String,
        required: [ true, "Job description is required" ]
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    turns: [ turnSchema ],
    status: {
        type: String,
        enum: [ "in-progress", "completed" ],
        default: "in-progress"
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    summary: {
        type: String,
    }
}, {
    timestamps: true
})


const mockInterviewSessionModel = mongoose.model("MockInterviewSession", mockInterviewSessionSchema);

module.exports = mockInterviewSessionModel;
