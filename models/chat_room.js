const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            },
            {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
