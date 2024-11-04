// routes/userRequestRoutes.js

const express = require('express');
const userRequestController = require('../controllers/userRequestController'); // Adjust path as needed
const authController = require('../controllers/authController'); // Adjust path as needed
const Router = express.Router();

// Route for getting all user requests and creating a new user request
Router.route('/')
    .get(authController.isLoggedIn, userRequestController.getAllUserRequests)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'support'),
        userRequestController.createUserRequest
    );

// Route for getting, deleting a specific user request by ID
Router.route('/:id')
    .get(authController.isLoggedIn, userRequestController.getUserRequest)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'support'),
        userRequestController.deleteUserRequest
    );

module.exports = Router;
