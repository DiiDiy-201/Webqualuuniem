const User = require("../models/user.model");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");

// Check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Đăng nhập để có thể mua sản phẩm", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
});

// // Check if admin is authenticated or not
// exports.isAuthenticatedAdmin = catchAsyncErrors(async (req, res, next) => {
//     const { tokenadmin } = req.cookies;

//     if (!tokenadmin) {
//         return next(new ErrorHandler("Đăng nhập để quản lý", 401));
//     }

//     const decoded = jwt.verify(tokenadmin, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);

//     next();
// });

// // Check if nhanvien is authenticated or not
// exports.isAuthenticatedNhanvien = catchAsyncErrors(async (req, res, next) => {
//     const { tokennhanvien } = req.cookies;

//     if (!tokennhanvien) {
//         return next(new ErrorHandler("Đăng nhập tài khoản nhân viên", 401));
//     }

//     const decoded = jwt.verify(tokennhanvien, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);

//     next();
// });

// // Check if shipper is authenticated or not
// exports.isAuthenticatedShipper = catchAsyncErrors(async (req, res, next) => {
//     const { tokenshipper } = req.cookies;

//     if (!tokenshipper) {
//         return next(new ErrorHandler("Đăng nhập tài khoản shipper", 401));
//     }

//     const decoded = jwt.verify(tokenshipper, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);

//     next();
// });

// Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role (${req.user.role}) is not allowed to access this resource`,
                    403
                )
            );
        }
        next();
    };
};
