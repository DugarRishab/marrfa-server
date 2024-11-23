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
const generateUID = require('./../utils/generateUID');

const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.memoryStorage({});

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

exports.reformatFields = catchAsync(async (req, res, next) => {
    const updatedFiles = {};
    console.log(req.files);
    // Process req.files if any (binary data)
    if (req.files) {
        Object.keys(req.files).forEach((fieldName) => {
            // Regex to match fields starting with 'images[gallery]' or 'images[floorMap]' etc.
            const match = fieldName.match(
                /images\[(gallery|floorMap)\]\[\d+\]/
            );

            if (match) {
                // Reformat the key to remove the index [0], [1], etc.
                const newFieldName = fieldName.replace(/\[\d+\]/, '');

                // Append the file to the appropriate field group
                if (!updatedFiles[newFieldName]) {
                    updatedFiles[newFieldName] = [];
                }
                updatedFiles[newFieldName].push(req.files[fieldName][0]);
            } else {
                // Keep non-matching fields as is
                updatedFiles[fieldName] = req.files[fieldName];
            }
        });

        // Replace the original req.files with updated structure
        req.files = updatedFiles;
    }

    console.log(req.files);
    console.log(req.body);

    next();
})

exports.uploadPropertyImages = catchAsync(async (req, res, next) => {
    // console.log(req);
    upload.fields([
        { name: 'images[heroImg]', maxCount: 1 }, // Single hero image
        { name: 'images[gallery]', maxCount: 5 }, // Up to 5 gallery images
        { name: 'images[floorMap]', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) {
            return next(new AppError('File upload failed: ' + err, 500));
        }

        console.log(req.body.images);

        let heroImgUrl, // Default to existing images
            galleryUrls = [], // Preserve existing gallery images
            floorMapUrl;
        
        if (req.body.images) {
            heroImgUrl = req.body.images.heroImg
                    ? req.body.images.heroImg
                    : null, // Default to existing images
                galleryUrls = [
                    ...(req.body.images.gallery ? req.body.images.gallery : []),
                ], // Preserve existing gallery images
                floorMapUrl = req.body.images.floorMap
                    ? req.body.images.floorMap
                    : null;
        }
        console.log(req.files);

        if (req.files && req.files['images[heroImg]']) {
            const file = req.files['images[heroImg]'][0];
            const fileName =
                'properties/' +
                generateUID(12) +
                '.' +
                file.mimetype.split('/')[1];
            heroImgUrl = await uploadToCloud(file, fileName); // Placeholder function
        }

        // Upload Gallery Images
        if (req.files && req.files['images[gallery]']) {
            for (const file of req.files['images[gallery]']) {
                const fileName =
                    'properties/' +
                    generateUID(12) +
                    '.' +
                    file.mimetype.split('/')[1];
                const galleryUrl = await uploadToCloud(file, fileName); // Placeholder function
                galleryUrls.push(galleryUrl);
            }
        }

        // Upload Floor Map
        if (req.files && req.files['images[floorMap]']) {
            const file = req.files['images[heroImg]'][0];
            const fileName =
                'properties/' +
                generateUID(12) +
                '.' +
                file.mimetype.split('/')[1];
            floorMapUrl = await uploadToCloud(file, fileName); // Placeholder function
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
    checkId(id, next);

    const updates = Object.keys(req.body)
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

exports.searchProperties = catchAsync(async (req, res, next) => {
    const {
        priceMin,
        priceMax,
        yieldMin,
        yieldMax,
        completionDate,
        marrfexIndexMin,
        marrfexIndexMax,
        areaMin,
        areaMax,
        // city,
        type, 
        occupancy, 
        search,
    } = req.query;

    // Ensure a valid search term is provided
    if (!search || search.length < 3) {
        return next(
            new AppError(
                'Please provide a query string called "search" of more than 3 letters',
                400
            )
        );
    }

    // Initialize the filter object
    const filter = {
        $or: [
            { name: { $regex: search, $options: 'i' } }, // Case-insensitive search
            { 'location.address': { $regex: search, $options: 'i' } },
            { 'location.city': { $regex: search, $options: 'i' } },
            { 'location.district': { $regex: search, $options: 'i' } },
            { 'location.state': { $regex: search, $options: 'i' } },
            { 'location.country': { $regex: search, $options: 'i' } },
        ],
    };

    // Add price range filter
    if (priceMin || priceMax) {
        filter['price.value'] = {};
        if (priceMin) filter['price.value'].$gte = priceMin;
        if (priceMax) filter['price.value'].$lte = priceMax;
    }

    // Add yield range filter
    if (yieldMin || yieldMax) {
        filter['finance.yield'] = {};
        if (yieldMin) filter['finance.yield'].$gte = yieldMin;
        if (yieldMax) filter['finance.yield'].$lte = yieldMax;
    }

    // Add CompletionDate exact match filter (now treated as a string)
    if (completionDate) {
        filter['metadata.completionDate'] = completionDate;
    }

    // Add Marrfex index filter
    if (marrfexIndexMin || marrfexIndexMax) {
        filter['finance.marrfex'] = {};
        if (marrfexIndexMin) filter['finance.marrfex'].$gte = marrfexIndexMin;
        if (marrfexIndexMax) filter['finance.marrfex'].$lte = marrfexIndexMax;
    }

    // Add area range filter
    if (areaMin || areaMax) {
        filter['layout.size.value'] = {};
        if (areaMin) filter['layout.size.value'].$gte = areaMin;
        if (areaMax) filter['layout.size.value'].$lte = areaMax;
    }

    // Add city filter
    // if (city) {
    //     filter['location.city'] = city;
    // }

    // Add property type filter
    // if (type) {
    //     filter.type = type;
    // }

    // Add occupancy filter
    // if (occupancy) {
    //     filter.occupancy = occupancy;
    // }

    // Find properties based on the filters
    const properties = await Property.find(filter).limit(10);

    // Return the filtered results
    res.status(200).json({
        message: 'success',
        items: properties.length,
        data: {
            properties,
        },
    });
});

