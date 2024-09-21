const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Blog = require('./../models/blogModel');
const checkId = require('./../utils/checkIdFormat');
const uploadToCloud = require('./../utils/uploadToCloud');

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


exports.uploadBlogImages = catchAsync(async (req, res, next) => {
    upload.fields([
        { name: 'coverImg', maxCount: 1 }, // Single hero image
    ])(req, res, async (err) => {
        if (err) {
            return next(new AppError('File upload failed', 500));
        }

		let coverImgUrl;

        if (req.files.coverImg) {
            const fileName =
                'blogs/' +
                generateUID(12) +
                '.' +
                file.mimetype.split('/')[1];
            coverImgUrl = await uploadToCloud(req.files.coverImg[0], fileName); // Placeholder function
        }

        req.body.images = {
            coverImg: coverImgUrl,
        };

        next();
    });
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
	let query;

	const blogs = await Blog.find(req.query);

	res.status(200).json({
		message: 'success',
		items: blogs.length,
		data: {
			blogs
		}
	})
});

exports.getBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    checkId(id); // checks the format of the id field

    const blog = await Blog.findById(id);

    if (!blog) {
        return next(new AppError('No such blog found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
        data: {
            blog,
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