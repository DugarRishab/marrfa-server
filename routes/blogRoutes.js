const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const Router = express.Router();

Router.route('/')
    .get(authController.isLoggedIn, blogController.getAllBlogs)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'editor'),
        blogController.uploadBlogImages,
        blogController.createBlog
    );

Router.route('/:id')
    .get(blogController.getBlog)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'editor'),
        blogController.uploadBlogImages,
        blogController.updateBlog
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'editor'),
        blogController.deleteBlog
    );

module.exports = Router;
