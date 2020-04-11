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
        isGroup: {
            type: Boolean,
            default: false
        },
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            }
        ],
        messages: [messageSchema]
    },
    {
        timestamps: true,
        toObject:{
            transform: (object, transformed) => {
                delete object.__v;
                transformed.id = object._id;
                delete object._id;
                return transformed
            }
        }
    }
);

module.exports = mongoose.model('chatRoom1', chatRoomSchema1);
