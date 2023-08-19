const User = require("../models/user.model");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");


const crypto = require("crypto");

// Register a user => api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    // phone,
    avatar: {
      public_id: 'avatars/avatar_ek4wie.jpg',
      url: 'https://res.cloudinary.com/dnsqlc3md/image/upload/v1691589866/avatars/avatar_ek4wie.jpg',
    },
  });

  sendToken(user, 200, res);
});

// Login User => api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Checks if email and password is intered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Finding user in database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Get currently logged in user details => api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update / Change password  => api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check previous user password
  const isMatched = await user.comparePassword(req.body.oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = req.body.password;

  await user.save();

  sendToken(user, 200, res);
});

// Update user profile => api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    //   phone: req.body.phone,
  };

  // Update avatar
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })
  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const image_id = user.avatar.public_id;
  //   const res = await cloudinary.v2.uploader.destroy(image_id);

  //   const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: result.public_id,
  //     url: result.secure_url,
  //   };
  // }

  // const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
  //   new: true,
  //   runValidators: true,
  //   useFindAndModify: false,
  // });

  res.status(200).json({
    success: true,
  });
});

// Logout User => api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Reset Password => api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash URL token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords does not match", 400));
  }

  // Setup new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Fotgot Password => api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset password url
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

  const message = `Mã thông báo đặt lại mật khẩu của bạn như sau: \n\n ${resetUrl}\n\nNếu bạn chưa yêu cầu email này, hãy bỏ qua nó.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "MeoShop Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Admin Routes

// Get all users => api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get user details => api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User dose not found with id: ${req.params.id} `, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Admin Update user profile => api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Admin Delete user  => api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); // Tìm và xóa sản phẩm dựa vào ID

    if (!user) {
      return next(
        new ErrorHandler(`User dose not found with id: ${req.params.id} `, 404)
      );
    }

    res.status(200).json({
      success: true,
      message: "User is deleted",
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user"
    });
  }
});
