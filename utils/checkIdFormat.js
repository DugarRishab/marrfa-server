const mongoose = require('mongoose');

const checkId = (id, next) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(`Invalid ID format: ${id}`, 400));
    }
}

module.exports = checkId;