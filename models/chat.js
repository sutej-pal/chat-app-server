const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Types.ObjectId,
            ref: 'ChatRoom'
        },
        message: {
            type: String,
            required: false
        },
        attachments: {
            required: false
        },
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        receiverId: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        seen: {
            type: Boolean
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('chat', chatSchema);
