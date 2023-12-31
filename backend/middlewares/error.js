const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errorMessage: err.message,
            stack: err.stack,
        });
    }

    if (process.env.NODE_ENV === "PRODUCTION") {
        let error = { ...err };
    
        error.message = err.message;
    // Wrong Mongoose ObjectId ID Error
    if (err.name === "CastError") {
        const message = `Resource not found .Invalid ${err.path}`;
        error = new ErrorHandler(message, 400);
    }

     // Handling Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new ErrorHandler(message, 400);
    }

      // Handling Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        error = new ErrorHandler(message, 400);
    }

      // Handling wrong JWT Error
    if (err.name === "JsonWebTokenError") {
        const message = "JSON Web Token Invalid. Try again!!!";
        error = new ErrorHandler(message, 400);
    }

      // Handling Expired JWT Error
    if (err.name === "TokenExpiredError") {
        const message = "JWT Token Expired. Try again!!!";
        error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
}
};
