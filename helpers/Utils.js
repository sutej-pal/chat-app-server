const User = require('../models/user');
const mongoose = require('mongoose');

module.exports = {
    async updateUserStatus(userId, isActive, lastActive, lastContacted) {
        let status = await User.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(userId)},
            {
                user: userId,
                isActive,
                lastActive,
                lastContacted
            },
            {upsert: true, new: true});
        console.log('hi', status)
    }
};
