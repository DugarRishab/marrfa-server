const express = require('express');
const propertyController = require('../controllers/propertyController');
const authController = require('../controllers/authController');

const Router = express.Router();

Router.route("/")
	.get(propertyController.getAllProperties)
	.post(propertyController.uploadPropertyImages, propertyController.createProperty);

Router.route("/:id")
	.get(propertyController.getProperty)
	.patch(propertyController.updateProperty)
	.delete(propertyController.deleteProperty);

module.exports = Router;