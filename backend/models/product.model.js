import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: 'Premium high-performance athletic apparel designed for comfort and elite durability.'
    },
    category: {
        type: String,
        required: true,
        enum: ['Football', 'Basketball', 'Cricket', 'Volleyball']
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 4.8
    },
    sizes: {
        type: [String],
        default: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const productData = mongoose.model('productData', productSchema)
export default productData
