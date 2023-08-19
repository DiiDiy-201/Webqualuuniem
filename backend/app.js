const express = require('express');
const app = express();

const errorMiddleware = require("./middlewares/error");

const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

// Import all routes
const products = require("./routes/product.route");
const users = require("./routes/user.route");
const order = require("./routes/order.route");

app.use("/api/v1", products);
app.use("/api/v1", users);
app.use('/api/v1', order);


// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app