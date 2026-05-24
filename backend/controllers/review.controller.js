import reviewData from '../models/review.model.js'
import userData from '../models/user.model.js'

export const addReview = async (req, res) => {
    try {
        const { jerseyName, rating, comment } = req.body
        const userId = req.userId

        if (!jerseyName || !rating || !comment) {
            return res.status(400).json({ message: "Jersey name, rating, and comment are required" })
        }

        const user = await userData.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const newReview = await reviewData.create({
            userId,
            userName: user.name,
            jerseyName,
            rating,
            comment
        })

        return res.status(201).json({ message: "Review posted successfully", review: newReview })
    } catch (error) {
        return res.status(500).json({ message: `Review submission failed: ${error.message}` })
    }
}

export const getJerseyReviews = async (req, res) => {
    try {
        const { jerseyName } = req.params
        const reviews = await reviewData.find({ jerseyName }).sort({ createdAt: -1 })
        
        let avgRating = 0
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
            avgRating = parseFloat((sum / reviews.length).toFixed(1))
        }

        return res.status(200).json({ reviews, avgRating, count: reviews.length })
    } catch (error) {
        return res.status(500).json({ message: `Failed to fetch reviews: ${error.message}` })
    }
}
