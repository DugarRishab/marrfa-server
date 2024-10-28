const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const checkId = require('./../utils/checkIdFormat');
const {
    allowedUserUpdateFields,
    allowedUserQueryFields,
} = require('../utils/allowedFields.');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    let query;

    if (req.query) {
        query = Object.keys(req.query)
            .filter((key) => allowedUserQueryFields.includes(key))
            .reduce((acc, key) => {
                acc[key] = req.body[key];
                return acc;
            }, {});
    }

    const users = await User.find(query);

    res.status(200).json({
        message: 'success',
        items: users.length,
        data: {
            users,
        },
    });
});
exports.updateUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    checkId(id);

    const updates = Object.keys(req.body)
        // .filter((key) => allowedUserUpdateFields.includes(key))
        .reduce((acc, key) => {
            acc[key] = req.body[key];
            return acc;
        }, {});

    console.log(updates);

    const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new AppError('No such user found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            user,
        },
    });
});
exports.getUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    checkId(id);

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('No such user found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            user,
        },
    });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    checkId(id);

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return next(new AppError('No such user found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
    });
});
exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
        message: 'success',
        data: {
            user: req.user,
        },
    });
});
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('this route is not for password update', 400));
    }

    const updates = Object.keys(req.body)
        .filter((key) => allowedUserUpdateFields.includes(key))
        .reduce((acc, key) => {
            acc[key] = req.body[key];
            return acc;
        }, {});

    console.log(updates);

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new AppError('No such user found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            user,
        },
    });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
        return next(new AppError('No such user found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
    });
});
