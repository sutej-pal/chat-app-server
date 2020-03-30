const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: false
        },
        attachments: {
            required: false
        },
        senderId: {
            required: true
        },
        receiverId: {
            required: true
        },
        seen: {
            type: Boolean
        }
    },
    {
        timestamp: true
    }
);

module.exports = mongoose.model('chat', chatSchema);
