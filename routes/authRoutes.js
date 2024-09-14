const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const Router = express.Router();

// %ROUTES% ->>
Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.protect, authController.logout);
Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
// Router.get('/google', authController.googleAuth);

Router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

// <<- %ROUTES%
module.exports = Router;