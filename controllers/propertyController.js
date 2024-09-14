const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Property = require('./../models/propertyModel');
const checkId = require('./../utils/checkIdFormat');
const {
    allowedPropertyQueryFields,
    allowedPropertyUpdateFields,
} = require('../utils/allowedFields.');
const uploadToCloud = require('./../utils/uploadToCloud');

const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // specify your directory for uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

// Multer config
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

exports.uploadPropertyImages = catchAsync(async (req, res, next) => {
    upload.fields([
        { name: 'heroImg', maxCount: 1 }, // Single hero image
        { name: 'gallery', maxCount: 5 }, // Up to 5 gallery images
        { name: 'floorMap', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) {
            return next(new AppError('File upload failed', 500));
        }

        let heroImgUrl,
            galleryUrls = [],
            floorMapUrl;

        if (req.files.heroImg) {
            heroImgUrl = await uploadToCloud(req.files.heroImg[0]); // Placeholder function
        }

        // Upload Gallery Images
        if (req.files.gallery) {
            for (const file of req.files.gallery) {
                const galleryUrl = await uploadToCloud(file); // Placeholder function
                galleryUrls.push(galleryUrl);
            }
        }

        // Upload Floor Map
        if (req.files.floorMap) {
            floorMapUrl = await uploadToCloud(req.files.floorMap[0]); // Placeholder function
        }

        req.body.images = {
            heroImg: heroImgUrl,
            gallery: galleryUrls,
            floorMap: floorMapUrl,
        };

        next();
    });
});

exports.getAllProperties = catchAsync(async (req, res, next) => {
    let query;

    if (req.query) {
        query = Object.keys(req.query)
            .filter((key) => allowedPropertyQueryFields.includes(key))
            .reduce((acc, key) => {
                acc[key] = req.body[key];
                return acc;
            }, {});
    }

    const properties = await Property.find(query);

    res.status(200).json({
        message: 'success',
        items: properties.length,
        data: {
            properties,
        },
    });
});

exports.getProperty = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    checkId(id); // checks the format of the id field

    const property = await Property.findById(id);

    if (!property) {
        return next(new AppError('No such property found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            property,
        },
    });
});

exports.createProperty = catchAsync(async (req, res, next) => {
    
    const newProperty = await Property.create(req.body);

    res.status(201).json({
        message: 'success',
        data: {
            property: newProperty,
        },
    });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    checkId(id);

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
        return next(new AppError('No such property found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
    });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    checkId(id);

    const updates = Object.keys(req.body)
        .filter((key) => allowedPropertyUpdateFields.includes(key))
        .reduce((acc, key) => {
            acc[key] = req.body[key];
            return acc;
        }, {});

    const property = await Property.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    if (!property) {
        return next(new AppError('No such property found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            property,
        },
    });
});
