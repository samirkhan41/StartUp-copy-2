import express from 'express'
import { addReview, getJerseyReviews } from '../controllers/review.controller.js'
import isAuth from '../middleware/isAuth.js'

const reviewRouter = express.Router()

reviewRouter.post('/add', isAuth, addReview)
reviewRouter.get('/jersey/:jerseyName', getJerseyReviews)

export default reviewRouter
