const express = require("express");
const router = express.Router();

const {
    getProducts,
    newProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsReviews,
    deleteReview
} = require('../controller/product.controller')

const {isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/products').get( getProducts);
router.route('/product/:id').get(getSingleProduct);
router.route('/reviews').get(isAuthenticatedUser, getProductsReviews);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

router.route('/admin/product/:id').put(isAuthenticatedUser,authorizeRoles('admin'), updateProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);

router.route('/admin/product/:id').delete(isAuthenticatedUser,authorizeRoles('admin'), deleteProduct);
router.route('/review').delete(isAuthenticatedUser, deleteReview);

module.exports = router;