const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        isActive: {
            type: Boolean
        },
        lastContacted: {
            type: Date
        }
    }
);

module.exports = mongoose.model('UserStatus', userStatusSchema);
