const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Blog needs a name'],
        trim: true,
    },
    coverImg: {
        type: String,
    },
    content: {
        type: String,
    },
    metadata: {
        datePosted: {
            type: Date,
            default: Date.now(),
        },
        dateUpdated: {
            type: Date,
            default: Date.now(),
        },
        likes: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    active: {
        type: Boolean,
        default: false
    },
    tags: {
        type: [String]
    }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;