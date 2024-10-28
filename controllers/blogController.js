const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Blog = require('./../models/blogModel');
const checkId = require('./../utils/checkIdFormat');
const uploadToCloud = require('./../utils/uploadToCloud');
const multer = require('multer');
const generateUID = require('./../utils/generateUID');

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


exports.uploadBlogImages = catchAsync(async (req, res, next) => {
    upload.fields([
        { name: 'coverImg', maxCount: 1 }, // Single hero image
    ])(req, res, async (err) => {
        if (err) {
            return next(new AppError('File upload failed', 500));
        }

		let coverImgUrl = req.body.coverImg || "";

        if (req.files && req.files.coverImg) {
            const file = req.files['coverImg'][0];
            const fileName =
                'blogs/' +
                generateUID(12) +
                '.' +
                file.mimetype.split('/')[1];
            coverImgUrl = await uploadToCloud(req.files.coverImg[0], fileName); // Placeholder function
            req.body.coverImg = coverImgUrl;
        }

       

        next();
    });
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
	let query = { active: { $ne: false } }; // Default query for active blogs

    // Check if the user is an admin or author to include drafts
    if (req.user.role === 'admin' || req.user.role === 'author') {
        query = {}; // No filter for active, include all blogs (including drafts)
    }

    if (req.query) {
        query = Object.keys(req.query)
            // .filter((key) => allowedPropertyQueryFields.includes(key))
            .reduce((acc, key) => {
                acc[key] = req.body[key];
                return acc;
            }, {});
    }

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

    checkId(id, next); // checks the format of the id field

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

exports.createBlog = catchAsync(async (req, res, next) => {
    const newBlog = await Blog.create(req.body);

    res.status(201).json({
        message: 'success',
        data: {
            blog: newBlog,
        },
    });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    checkId(id);

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
        return next(new AppError('No such blog found with id: ' + id, 404));
    }

    res.status(200).json({
        message: 'success',
    });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    checkId(id);

    const updates = Object.keys(req.body)
        // .filter((key) => allowedPropertyUpdateFields.includes(key))
        .reduce((acc, key) => {
            acc[key] = req.body[key];
            return acc;
        }, {});

    const blog = await Blog.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

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