const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true,
        maxLength: [100, "Product name can not be more than 100 characters"],
    },

    price: {
        type: Number,
        required: [true, "Please enter product price"],
        maxLength: [5, "Product price can not be more than 5 characters"],
        default: 0.0,
    },

    description: {
        type: String,
        required: [true, "Please enter product description"],
    },

    ratings: {
        type: Number,
        default: 0,
    },

    images: [
        {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        },
    ],

    category: {
        type: String,
        required: [true, "Please select category for this product"],
        enum: {
            values: [
                'Qùa tặng gia đình',
                'Qùa tặng bạn bè',
                'Qùa tặng Valentine',
                'Qùa tặng Sếp',
                'Qùa tặng Giáng Sinh',
                'Qùa lưu niệm',
                'Đồ trang trí'
            ],
            message: "Please select category for this product"
        }
    },

    seller: {
        type: String,
        required: [true, "Please enter product seller "],
    },

    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxLength: [5, "Product stock can not be more than 5 characters"],
        default: 0,
    },

    numOfReviews: {
        type: Number,
        default: 0,
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Product", productSchema);

