import express from 'express'
import multer from 'multer'
import { createProduct, getProducts, deleteProduct } from '../controllers/product.controller.js'
import adminAuth from '../middleware/adminAuth.js'

const productRouter = express.Router()

// Setup Multer temp folder upload
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// Public catalog access
productRouter.get('/all', getProducts)

// Admin-only commands
productRouter.post('/create', adminAuth, upload.single('image'), createProduct)
productRouter.delete('/delete/:id', adminAuth, deleteProduct)

export default productRouter
