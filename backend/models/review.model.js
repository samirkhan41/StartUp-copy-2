import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    jerseyName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true })

const reviewData = mongoose.model('reviewData', reviewSchema)

export default reviewData
