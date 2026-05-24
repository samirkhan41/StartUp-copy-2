import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import productData from '../models/product.model.js'

// Create dynamic product with Cloudinary image upload
export const createProduct = async (req, res) => {
    try {
        // Dynamically configure Cloudinary inside the request to guarantee process.env values are fully loaded!
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        })

        const { name, price, description, category, sizes } = req.body
        
        if (!name || !price || !category) {
            if (req.file) fs.unlinkSync(req.file.path)
            return res.status(400).json({ message: "Product name, price, and category are required" })
        }

        if (!req.file) {
            return res.status(400).json({ message: "Product display image is required" })
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: 'teesx_jerseys',
            transformation: [{ width: 600, height: 600, crop: "limit" }]
        })

        // Remove local file
        try {
            fs.unlinkSync(req.file.path)
        } catch (err) {
            console.error("Failed to delete temp file:", err)
        }

        // Parse sizes (accepts array or JSON string)
        let parsedSizes = ['M', 'L']
        if (sizes) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes
            } catch (err) {
                // If it's a comma-separated list
                parsedSizes = sizes.split(',').map(s => s.trim())
            }
        }

        const newProduct = await productData.create({
            name,
            price: Number(price),
            description: description || undefined,
            category,
            sizes: parsedSizes,
            image: uploadResult.secure_url
        })

        return res.status(201).json({ message: "Product created successfully", product: newProduct })
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        return res.status(500).json({ message: `Failed to create product: ${error.message}` })
    }
}

// Fetch all inventory products
export const getProducts = async (req, res) => {
    try {
        const products = await productData.find({}).sort({ createdAt: -1 })
        return res.status(200).json({ products })
    } catch (error) {
        return res.status(500).json({ message: `Failed to fetch products: ${error.message}` })
    }
}

// Delete inventory product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params
        const product = await productData.findByIdAndDelete(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        return res.status(200).json({ message: "Product deleted successfully from catalog inventory" })
    } catch (error) {
        return res.status(500).json({ message: `Failed to delete product: ${error.message}` })
    }
}
