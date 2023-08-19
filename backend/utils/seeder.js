const Product = require("../models/product.model");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

const products = require("../data/product.json");

// Setting dotenv File
dotenv.config({ path: "backend/config/.env" });

connectDatabase();

const seedProducts = async () => {
    try {
        await Product.deleteMany();
        console.log("Products are Deleted");

        await Product.insertMany(products);
        console.log("All Products are added");

        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
};

seedProducts();
