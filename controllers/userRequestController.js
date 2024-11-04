// controllers/userRequestController.js

const UserRequest = require('../models/userRequestModel'); // Adjust path as needed
const catchAsync = require('../utils/catchAsync'); // Adjust path as needed
const AppError = require('../utils/appError'); // Adjust path as needed
const checkId = require('./../utils/checkIdFormat');
const mongoose = require('mongoose');

// Get single UserRequest by ID
exports.getUserRequest = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    checkId(id, next); // Validate ID format

    const userRequest = await UserRequest.findById(id);

    if (!userRequest) {
        return next(new AppError('No user request found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            userRequest,
        },
    });
});

// Get all UserRequests
exports.getAllUserRequests = catchAsync(async (req, res, next) => {
    const userRequests = await UserRequest.find();

    res.status(200).json({
        message: 'success',
        results: userRequests.length,
        data: {
            userRequests,
        },
    });
});

// Create a new UserRequest
exports.createUserRequest = catchAsync(async (req, res, next) => {
    const newUserRequest = await UserRequest.create(req.body);

    res.status(201).json({
        message: 'success',
        data: {
            userRequest: newUserRequest,
        },
    });
});

// Delete a UserRequest by ID
exports.deleteUserRequest = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    checkId(id, next); // Validate ID format

    const userRequest = await UserRequest.findByIdAndDelete(id);

    if (!userRequest) {
        return next(new AppError('No user request found with id: ' + id, 404));
    }

    res.status(204).json({
        message: 'success',
        data: null,
    });
});
