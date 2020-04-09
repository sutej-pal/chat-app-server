const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        message: {
            type: String
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

const chatRoomSchema1 = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            }
        ],
        messages: [messageSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('chatRoom1', chatRoomSchema1);
